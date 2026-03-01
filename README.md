# smart-blessings
智能祝福语生成器。根据时间、对方的称呼、身份，利用AI大模型生成祝福语，并提供一键复制功能。

# ✨ Smart Blessings - AI 智能祝福语生成器

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## 📖 简介
基于通义千问大模型的智能祝福语生成器，支持多种风格和身份定制。

## ✨ 特性
- 🎨 6种祝福风格（幽默、真诚、传统等）
- 👥 8种身份适配
- 📅 多节日支持
- 📋 一键复制
- 🌐 本地服务器部署

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 配置环境变量
```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填写你的 API Key
DASHSCOPE_API_KEY=your_api_key_here
```

### 启动服务
```bash
npm start
```

访问 http://localhost:3000

## 📄 开源协议
MIT License