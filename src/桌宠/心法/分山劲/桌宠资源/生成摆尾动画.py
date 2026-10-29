# -*- coding: utf-8 -*-
"""
生成小狮子桌宠的待机/点击动画（子矩形 APNG）。

用法：
    cd 本目录 && python 生成摆尾动画.py       （依赖：pip install pillow numpy）

素材（手绘，600×600 透明底）：
    待机.png  + 待机摇尾巴.png  → 待机动画.png：静止约 3.3 秒快速甩两下（偶尔甩尾）
    噘嘴.png / 喷火.png / 血怒.png 为点击序列帧素材，本脚本不处理；
    拖拽的情绪弧线（喷火→血怒→噘嘴→待机摇尾）在 配置.ts 的序列帧里直接编排。

原理：
    第 1 帧输出整幅画面，其后每帧只更新差异区域。无损、保留手绘软阴影的
    全 alpha，静止帧即原画，不支持 APNG 的环境自动回退为静态原画。
重画母版后重跑本脚本即可；节奏改脚本内常量。
"""
import os
import struct
import zlib

import numpy as np
from PIL import Image

本目录 = os.path.dirname(os.path.abspath(__file__))

# ── 动画节奏 ──
待机停顿毫秒 = 3300          # 待机时每次甩尾之间的静止时长
待机甩尾 = [('摆尾', 140), ('基础', 110), ('摆尾', 140), ('基础', 170)]
区域余量 = 8                 # 差异包围盒四周的余量像素


def 读RGBA(路径):
    return np.array(Image.open(路径).convert('RGBA'))


def 计算差异区域(基础, 摆尾):
    """两帧可见差异（影响 alpha 或透明度变化的像素）的包围盒 + 余量。"""
    差异 = np.abs(基础.astype(int) - 摆尾.astype(int)).max(axis=2)
    可见 = (差异 > 2) & ((基础[..., 3] > 0) | (摆尾[..., 3] > 0))
    ys, xs = np.nonzero(可见)
    高, 宽 = 基础.shape[:2]
    if not len(xs):
        raise SystemExit('两帧没有可见差异，请检查母版')
    x0 = max(0, int(xs.min()) - 区域余量)
    y0 = max(0, int(ys.min()) - 区域余量)
    x1 = min(宽, int(xs.max()) + 1 + 区域余量)
    y1 = min(高, int(ys.max()) + 1 + 区域余量)
    # 区域外不允许有 alpha 差异（否则动画切换时身体会闪）
    区域掩码 = np.zeros((高, 宽), dtype=bool)
    区域掩码[y0:y1, x0:x1] = True
    alpha差异 = np.abs(基础[..., 3].astype(int) - 摆尾[..., 3].astype(int))
    外部alpha差 = int(alpha差异[~区域掩码].max())
    if 外部alpha差 != 0:
        raise SystemExit('两帧在尾巴区域外存在 alpha 差异（最大 %d），请检查母版是否错位' % 外部alpha差)
    return (x0, y0, x1, y1), int(可见.sum())


def 原始扫描线(img):
    raw = img.tobytes()
    行宽 = img.width * 4
    行 = [b'\x00' + raw[y * 行宽:(y + 1) * 行宽] for y in range(img.height)]
    return zlib.compress(b''.join(行), 9)


def chunk(类型, 数据):
    return struct.pack('>I', len(数据)) + 类型 + 数据 + struct.pack('>I', zlib.crc32(类型 + 数据) & 0xFFFFFFFF)


def 写子矩形APNG(路径, 帧序列, 帧画面, 区域, 宽, 高):
    """帧序列: [(姿势名, 延时毫秒), ...]，帧画面: {姿势名: PIL.Image}。
    第 1 帧输出整幅画面，其后每帧只更新区域。"""
    seq = 0
    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', 宽, 高, 8, 6, 0, 0, 0))
    out += chunk(b'acTL', struct.pack('>II', len(帧序列), 0))
    out += chunk(b'fcTL', struct.pack('>IIIIIHHBB', seq, 宽, 高, 0, 0, 帧序列[0][1], 1000, 0, 0))
    seq += 1
    out += chunk(b'IDAT', 原始扫描线(帧画面[帧序列[0][0]]))
    for 姿势, 延时 in 帧序列[1:]:
        帧块 = 帧画面[姿势].crop(区域)
        out += chunk(b'fcTL', struct.pack('>IIIIIHHBB', seq, 区域[2] - 区域[0],
                                          区域[3] - 区域[1], 区域[0], 区域[1], 延时, 1000, 0, 0))
        seq += 1
        out += chunk(b'fdAT', struct.pack('>I', seq) + 原始扫描线(帧块))
        seq += 1
    out += chunk(b'IEND', b'')
    with open(路径, 'wb') as f:
        f.write(out)
    print('%s  %.1f KB（%d 帧）' % (os.path.basename(路径), os.path.getsize(路径) / 1024, len(帧序列)))


def 校验(路径, 帧序列, 帧画面, 区域):
    """重新打开产物：逐帧与期望姿势区域对比（无损应逐像素一致），并核对延时。"""
    im = Image.open(路径)
    assert im.n_frames == len(帧序列), (路径, im.n_frames, len(帧序列))
    for i, (姿势, 延时) in enumerate(帧序列):
        im.seek(i)
        assert im.info.get('duration') == 延时, (路径, i, im.info.get('duration'), 延时)
        实际 = np.array(im.convert('RGBA')).astype(int)
        期望整幅 = np.array(帧画面[姿势]).astype(int)
        差异 = np.abs(实际 - 期望整幅)
        不透明 = (实际[..., 3] > 0) & (期望整幅[..., 3] > 0)
        assert 差异[..., 3].max() == 0, (路径, i, 'alpha不一致')
        assert 差异[..., :3][不透明].max() == 0, (路径, i, '不透明区RGB不一致')
    print('%s 校验通过（%d 帧全部与期望姿势逐像素一致）' % (os.path.basename(路径), len(帧序列)))


def 生成一对(基础名, 摆尾名, 输出名, 序列):
    基础 = 读RGBA(os.path.join(本目录, 基础名))
    摆尾 = 读RGBA(os.path.join(本目录, 摆尾名))
    assert 基础.shape == 摆尾.shape, '两帧尺寸不一致'
    高, 宽 = 基础.shape[:2]
    区域, 差异像素 = 计算差异区域(基础, 摆尾)
    print('%s + %s：差异像素 %d，子矩形区域 %s（%dx%d）' %
          (基础名, 摆尾名, 差异像素, 区域, 区域[2] - 区域[0], 区域[3] - 区域[1]))

    帧画面 = {'基础': Image.fromarray(基础), '摆尾': Image.fromarray(摆尾)}
    路径 = os.path.join(本目录, 输出名)
    写子矩形APNG(路径, 序列, 帧画面, 区域, 宽, 高)
    校验(路径, 序列, 帧画面, 区域)


if __name__ == '__main__':
    待机序列 = [('基础', 待机停顿毫秒)] + 待机甩尾
    生成一对('待机.png', '待机摇尾巴.png', '待机动画.png', 待机序列)
