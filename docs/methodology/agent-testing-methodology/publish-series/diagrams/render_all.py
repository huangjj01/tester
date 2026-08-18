#!/usr/bin/env python3
"""
将 diagrams/ 下所有 .mmd 文件通过 mermaid.ink 渲染为 PNG 图片。
无需安装任何额外依赖，只用 Python 标准库。

用法：
    python3 render_all.py

输出：
    每个 .mmd 文件生成同名 .png 文件到 output/ 目录
"""

import base64
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path


def render_mermaid_to_png(mmd_content: str, output_path: str) -> bool:
    """通过 mermaid.ink API 将 mermaid 代码渲染为 PNG"""
    # mermaid.ink 接受 base64 编码的 mermaid 代码
    encoded = base64.urlsafe_b64encode(mmd_content.encode('utf-8')).decode('ascii')
    url = f"https://mermaid.ink/img/{encoded}?type=png&bgColor=white&width=1200"
    
    try:
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0')
        with urllib.request.urlopen(req, timeout=30) as response:
            png_data = response.read()
            with open(output_path, 'wb') as f:
                f.write(png_data)
            return True
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        print(f"  ❌ 渲染失败: {e}")
        return False


def main():
    script_dir = Path(__file__).parent
    output_dir = script_dir / "output"
    output_dir.mkdir(exist_ok=True)
    
    mmd_files = sorted(script_dir.glob("*.mmd"))
    
    if not mmd_files:
        print("未找到 .mmd 文件")
        sys.exit(1)
    
    print(f"找到 {len(mmd_files)} 个 .mmd 文件，开始渲染...\n")
    
    success = 0
    failed = 0
    
    for mmd_file in mmd_files:
        output_path = output_dir / f"{mmd_file.stem}.png"
        print(f"  渲染: {mmd_file.name} → output/{output_path.name} ...", end=" ")
        
        content = mmd_file.read_text(encoding='utf-8')
        if render_mermaid_to_png(content, str(output_path)):
            size_kb = output_path.stat().st_size / 1024
            print(f"✅ ({size_kb:.1f} KB)")
            success += 1
        else:
            failed += 1
    
    print(f"\n完成: {success} 成功, {failed} 失败")
    print(f"输出目录: {output_dir}")


if __name__ == "__main__":
    main()
