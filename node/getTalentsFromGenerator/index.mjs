import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import menpaiData from '../datasource/kongfuMap.mjs'; // 新增新心法需要更换
import talentData from './datasource.mjs'; // 每次更新前需从Generator项目更新

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取skill.txt文件并构建ID到IconID的映射
async function loadSkillIconMap() {
  try {
    /**
     * 用于获取iconId,奇穴换位置不用更新.
     * !若有新增奇穴需要更新
     */
    const skillContent = await fs.readFile(path.join(__dirname, '..', 'datasource', 'skill.txt'), 'utf8');
    const lines = skillContent.split('\n').filter(line => line.trim());
    
    // 第一行是标题行
    const headers = lines[0].split('\t');
    const skillIdIndex = headers.indexOf('SkillID');
    const iconIdIndex = headers.indexOf('IconID');

    if (skillIdIndex === -1 || iconIdIndex === -1) {
      throw new Error('skill.txt文件中找不到SkillID或IconID列');
    }
    
    const iconMap = {};
    
    // 处理每一行数据
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split('\t');
      if (columns.length > Math.max(skillIdIndex, iconIdIndex)) {
        const skillId = columns[skillIdIndex].trim();
        const iconId = columns[iconIdIndex].trim();
        
        if (skillId && iconId) {
          iconMap[skillId] = iconId;
        }
      }
    }
    
    return iconMap;
  } catch (error) {
    console.error('读取skill.txt文件失败:', error);
    return {};
  }
}

// 解析Python格式的talents.py文件
function parsePythonTalents(content) {  
  try {
    // 提取 TALENTS 数组部分
    const talentsMatch = content.match(/TALENTS:\s*list\[dict\[int,\s*dict\]\]\s*=\s*(\[.*\]);?/s);
    if (!talentsMatch) {
        throw new Error('无法找到 TALENTS 定义');
    }
    
    let talentsStr = talentsMatch[1];
    
    // 移除注释
    talentsStr = talentsStr.replace(/#.*$/gm, '');
    
    // 将 Python dict() 调用转换为 JavaScript 对象字面量
    talentsStr = talentsStr.replace(/dict\(/g, '{');
    talentsStr = talentsStr.replace(/\)(?=\s*[},])/g, '}');
    
    // 处理键值对
    talentsStr = talentsStr.replace(/(\w+)=/g, '"$1":');
    
    // 确保所有键都是字符串（用引号括起来）
    talentsStr = talentsStr.replace(/([{,]\s*)(\d+)(\s*:)/g, '$1"$2"$3');
    
    // 解析为 JavaScript 对象
    const talents = eval(`(${talentsStr})`);
    
    // 提取每个子对象的第一层键，形成二维数组
    const firstLevelKeys = talents.map(talentDict => 
        Object.keys(talentDict).map(Number)
    );
    return firstLevelKeys;
  } catch (error) {
    console.error('解析talents.py文件失败:', error);
    return [];
  }
}

// 读取并解析talents.py文件
async function loadTalentsPy(nameInGenerator) {
  try {
    const talentsPath = path.join(__dirname, '..', '..', '..', 'Generator', 'kungfus', nameInGenerator, 'talents.py');
    const content = await fs.readFile(talentsPath, 'utf8');
    return parsePythonTalents(content);
  } catch (error) {
    console.error(`读取talents.py文件失败 (${nameInGenerator}):`, error);
    return [];
  }
}

// 生成奇穴数据
async function generateTalentData(menpaiId, iconMap) {
  const talents = talentData[menpaiId];
  if (!talents) return null;

  // 获取门派信息
  const menpaiInfo = menpaiData[menpaiId];
  if (!menpaiInfo) {
    console.log(`未找到门派 ${menpaiId} 的映射信息，跳过`);
    return null;
  }
  // 读取talents.py文件
  const talentsPy = await loadTalentsPy(menpaiInfo.name_in_generator);
  if (!talentsPy.length) {
    console.log(`未找到门派 ${menpaiInfo.name} 的talents.py数据，跳过`);
    return null;
  }

  const layers = [];
  
  // 处理前7层
  for (let i = 0; i < 7; i++) {
    const layerData = talentsPy[i] || [];
    const layerTalents = [];
    
    // 按talents.py中的顺序处理每个奇穴
    for (const talentId of layerData) {
      const talent = talents[talentId];
      if (talent && talent.name) {
        layerTalents.push({
          奇穴名称: talent.name,
          奇穴图片: talentId && iconMap[talentId] ? `https://icon.jx3box.com/icon/${iconMap[talentId]}.png` : '',
          id: talentId.toString() || '',
          奇穴描述: talent.desc || ''
        });
      }
    }
    
    layers.push({
      奇穴列表: layerTalents
    });
  }

  // 处理第8层（混池）
  const eighthLayerData = talentsPy[7] || [];
  const eighthLayerTalents = [];
  
  for (const talentId of eighthLayerData) {
    const talent = talents[talentId];
    if (talent && talent.name) {
      eighthLayerTalents.push({
        奇穴名称: talent.name,
        奇穴图片: talentId && iconMap[talentId] ? `https://icon.jx3box.com/icon/${iconMap[talentId]}.png` : '',
        id: talentId.toString() || '',
        奇穴描述: talent.desc || ''
      });
    }
  }
  
  layers.push({
    是否为混池: true,
    奇穴列表: eighthLayerTalents
  });

  return layers;
}

// 生成文件内容
function generateFileContent(talentData) {
  return `import type { 奇穴列表数据类型 } from '@/@types/奇穴'

const 奇穴数据: 奇穴列表数据类型[] = ${JSON.stringify(talentData, null, 2).replace(/"(\w+)":/g, '$1:')}

export default 奇穴数据`;
}

async function main() {
  try {
    const successList = [];
    const notFoundList = [];
    // 加载技能图标映射
    const iconMap = await loadSkillIconMap();
    console.log(`已加载 ${Object.keys(iconMap).length} 个技能图标映射`);
    
    // 处理每个门派
    for (const [menpaiId, menpaiInfo] of Object.entries(menpaiData)) {
      console.log(`处理门派: ${menpaiInfo.name} (${menpaiId})`);
      
      // 生成奇穴数据
      const talents = await generateTalentData(menpaiId, iconMap);
      if (!talents) {
        notFoundList.push(menpaiInfo.name)
        continue;
      }

      // 创建目标目录
      const targetDir = path.join(__dirname, '..', '..', 'src', '心法模块', '心法', menpaiInfo.name, '奇穴');
      await fs.mkdir(targetDir, { recursive: true });

      // 写入文件
      const fileContent = generateFileContent(talents, menpaiInfo.name);
      await fs.writeFile(path.join(targetDir, 'index.ts'), fileContent, 'utf8');
      successList.push(menpaiInfo.name)
    }

    console.log('===============所有门派处理完成==============');
    console.log(`成功处理: ${successList}`)
    console.log(`未找到门派列表: ${notFoundList}`)
  } catch (error) {
    console.error('处理过程中出错:', error);
  }
}

// 执行主函数
main();