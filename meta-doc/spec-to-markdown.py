#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Spec to Markdown Converter
将JSON格式的需求规格文档转换为Markdown格式
"""

import json
import sys
from datetime import datetime
from pathlib import Path

def load_spec(file_path):
    """加载JSON规格文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"错误：找不到文件 {file_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"错误：JSON格式无效 - {e}")
        sys.exit(1)

def format_core_idea(core_idea):
    """格式化核心理念部分"""
    md = "## 🎯 核心理念\n\n"
    md += f"### 问题陈述\n{core_idea['problemStatement']}\n\n"
    md += f"### 目标用户\n{core_idea['targetAudience']}\n\n"
    md += f"### 核心价值\n{core_idea['coreValue']}\n\n"
    return md

def format_scope(scope):
    """格式化项目范围部分"""
    md = "## 🔍 项目范围\n\n"
    
    md += "### ✅ 范围内\n"
    for item in scope['inScope']:
        md += f"- {item}\n"
    md += "\n"
    
    md += "### ❌ 范围外\n"
    for item in scope['outOfScope']:
        md += f"- {item}\n"
    md += "\n"
    
    return md

def format_scenarios(scenarios):
    """格式化用户场景部分"""
    if not scenarios:
        return ""
    
    md = "## 📖 用户场景\n\n"
    
    for scenario in scenarios:
        md += f"### {scenario['name']}\n"
        if 'id' in scenario:
            md += f"**场景ID**: `{scenario['id']}`\n\n"
        
        # 用户故事
        story = scenario['story']
        md += f"**用户故事**: 作为{story['userType']}，我希望{story['action']}，以便{story['benefit']}。\n\n"
        
        # 所需功能
        md += "**所需功能**:\n"
        for func in scenario['requiredFunctions']:
            md += f"- {func}\n"
        md += "\n"
        
        # 验收标准
        if 'acceptanceCriteria' in scenario and scenario['acceptanceCriteria']:
            md += "**验收标准**:\n"
            for criteria in scenario['acceptanceCriteria']:
                md += f"- {criteria}\n"
            md += "\n"
        
        # 优先级和状态
        if 'priority' in scenario:
            priority = scenario['priority']
            md += f"**优先级**: {priority['level']}"
            if 'justification' in priority:
                md += f" - {priority['justification']}"
            md += "\n\n"
        
        if 'status' in scenario:
            md += f"**状态**: {scenario['status']}\n\n"
        
        if 'estimatedComplexity' in scenario:
            complexity_emoji = {'Low': '🟢', 'Medium': '🟡', 'High': '🔴'}
            emoji = complexity_emoji.get(scenario['estimatedComplexity'], '')
            md += f"**预估复杂度**: {emoji} {scenario['estimatedComplexity']}\n\n"
        
        # 依赖关系
        if 'dependencies' in scenario and scenario['dependencies']:
            md += "**依赖场景**: "
            md += ", ".join([f"`{dep}`" for dep in scenario['dependencies']])
            md += "\n\n"
        
        md += "---\n\n"
    
    return md

def format_prioritization(prioritization):
    """格式化优先级规划部分"""
    if not prioritization:
        return ""
    
    md = "## 🚀 优先级规划\n\n"
    
    priority_sections = [
        ('MVP', '🎯 最小可行产品', prioritization.get('MVP', [])),
        ('Later', '📅 后续版本', prioritization.get('Later', [])),
        ('Maybe', '🤔 可能考虑', prioritization.get('Maybe', [])),
        ('System', '⚙️ 系统能力', prioritization.get('System', [])),
    ]
    
    for key, title, items in priority_sections:
        if items:
            md += f"### {title}\n"
            for item in items:
                md += f"- `{item}`\n"
            md += "\n"
    
    return md

def format_decision_log(decision_log):
    """格式化决策记录部分"""
    if not decision_log:
        return ""
    
    md = "## 📝 决策记录\n\n"
    
    for i, decision in enumerate(decision_log, 1):
        status_emoji = {'Proposed': '🤔', 'Accepted': '✅', 'Rejected': '❌'}
        emoji = status_emoji.get(decision.get('status', ''), '')
        
        md += f"### 决策 {i}: {decision['decision']} {emoji}\n"
        md += f"**日期**: {decision['date']}\n\n"
        
        if 'reason' in decision:
            md += f"**理由**: {decision['reason']}\n\n"
        
        if 'rejectedOptions' in decision and decision['rejectedOptions']:
            md += "**被拒绝的选项**:\n"
            for option in decision['rejectedOptions']:
                md += f"- {option}\n"
            md += "\n"
        
        if 'decisionType' in decision:
            md += f"**决策类型**: {decision['decisionType']}\n\n"
        
        md += "---\n\n"
    
    return md

def format_change_history(change_history):
    """格式化变更历史部分"""
    if not change_history:
        return ""
    
    md = "## 📋 变更历史\n\n"
    
    for change in change_history:
        md += f"### {change['date']}\n"
        md += f"{change['description']}\n\n"
        
        if 'related' in change and change['related']:
            md += "**相关字段**: "
            md += ", ".join([f"`{field}`" for field in change['related']])
            md += "\n\n"
    
    return md

def format_end_to_end_flow(flow):
    """格式化端到端流程部分"""
    if not flow:
        return ""
    md = "## 🧭 端到端流程\n\n"
    if 'title' in flow and flow['title']:
        md += f"### {flow['title']}\n\n"
    if 'description' in flow and flow['description']:
        md += f"{flow['description']}\n\n"
    if 'steps' in flow and flow['steps']:
        for step in flow['steps']:
            md += f"- {step}\n"
        md += "\n"
    return md

def format_non_functional_notes(notes):
    """格式化非功能性需求部分（结构化）"""
    if not notes:
        return ""
    md = "## ⚡ 非功能性需求\n\n"
    for item in notes:
        if isinstance(item, str):
            md += f"- {item}\n\n"
            continue
        category = item.get('category', '')
        note = item.get('note', '')
        targets = item.get('targets', [])
        if category:
            md += f"### {category}\n"
        if note:
            md += f"{note}\n\n"
        if targets:
            for target in targets:
                mode = target.get('mode', '')
                constraints = target.get('constraints', [])
                if mode:
                    md += f"#### {mode}\n"
                for c in constraints:
                    md += f"- {c}\n"
                md += "\n"
    return md

def format_meta(meta):
    """格式化元数据部分"""
    if not meta:
        return ""
    
    md = "## 📊 文档元数据\n\n"
    
    if 'generatedBy' in meta and meta['generatedBy']:
        md += "**生成者**: "
        md += ", ".join(meta['generatedBy'])
        md += "\n\n"
    
    if 'documentStatus' in meta:
        status_emoji = {'Draft': '📝', 'InReview': '👀', 'Active': '✅', 'Archived': '📦'}
        emoji = status_emoji.get(meta['documentStatus'], '')
        md += f"**文档状态**: {emoji} {meta['documentStatus']}\n\n"
    
    if 'tags' in meta and meta['tags']:
        md += "**标签**: "
        md += ", ".join([f"`{tag}`" for tag in meta['tags']])
        md += "\n\n"
    
    return md

def format_interaction_session_models(section):
    """格式化交互与会话模型说明"""
    if not section:
        return ""
    title = section.get('title', '交互与会话模型说明')
    models = section.get('models', [])
    if not models:
        return ""
    md = f"## 🏗️ {title}\n\n"
    for m in models:
        mid = m.get('id', '')
        name = m.get('name', '')
        desc = m.get('description', '')
        core = m.get('coreConcept', '')
        multi = m.get('multiDocHandling', '')
        persistence = m.get('persistence', {})
        header = f"模型 {mid}：{name}".strip('：')
        md += f"### {header}\n"
        if desc:
            md += f"- 描述：{desc}\n"
        if core:
            md += f"- 核心概念：{core}\n"
        if multi:
            md += f"- 多文档处理：{multi}\n"
        if isinstance(persistence, dict):
            opts = persistence.get('options')
            pdesc = persistence.get('description')
            if opts:
                md += f"- 持久化与会话：\n"
                for opt in opts:
                    oid = opt.get('id', '')
                    otitle = opt.get('title', '')
                    odesc = opt.get('description', '')
                    label = f"选项 {oid}（{otitle}）" if oid or otitle else "选项"
                    md += f"  - {label}：{odesc}\n"
            elif pdesc:
                md += f"- 持久化与会话：{pdesc}\n"
        md += "\n"
    return md

def spec_to_markdown(spec_data):
    """将规格数据转换为Markdown格式"""
    md = f"# {spec_data.get('title', '项目需求规格文档')}\n\n"
    md += f"**最后更新**: {spec_data['lastUpdated']}\n"
    md += f"**规格版本**: {spec_data['specVersion']}\n\n"
    md += format_core_idea(spec_data['coreIdea'])
    md += format_scope(spec_data['scope'])
    if 'endToEndFlow' in spec_data:
        md += format_end_to_end_flow(spec_data['endToEndFlow'])
    if 'scenarios' in spec_data:
        md += format_scenarios(spec_data['scenarios'])
    if 'interactionSessionModels' in spec_data:
        md += format_interaction_session_models(spec_data['interactionSessionModels'])
    if 'prioritization' in spec_data:
        md += format_prioritization(spec_data['prioritization'])
    if 'decisionLog' in spec_data:
        md += format_decision_log(spec_data['decisionLog'])
    if 'changeHistory' in spec_data:
        md += format_change_history(spec_data['changeHistory'])
    if 'nonFunctionalNotes' in spec_data:
        md += format_non_functional_notes(spec_data['nonFunctionalNotes'])
    if 'meta' in spec_data:
        md += format_meta(spec_data['meta'])
    md += "---\n\n"
    md += f"*此文档由 spec-to-markdown 工具自动生成于 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"
    return md

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python spec-to-markdown.py <spec.json> [output.md]")
        print("示例: python spec-to-markdown.py clario-spec.json clario-spec.md")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.json', '.md')
    
    # 加载规格文件
    spec_data = load_spec(input_file)
    
    # 转换为Markdown
    markdown_content = spec_to_markdown(spec_data)
    
    # 保存Markdown文件
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        print(f"✅ 成功生成Markdown文档: {output_file}")
    except Exception as e:
        print(f"❌ 保存文件时出错: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()