# 测试实施阶段协作流程图

当用户说“我需要进入测试实施阶段了，告诉我怎么进行”或类似表达时，优先展示或解释本图。重点说明：实施指南负责“怎么测”，Record 工作稿负责“测到哪了”，长周期 case 通过 Record 中的输入、关键标识、观察节点和待补证据交接，不依赖聊天上下文续跑。

```mermaid
sequenceDiagram
    autonumber

    actor U as 使用者
    participant A as Agent
    participant R as Runner 门禁
    participant G as 测试实施指南
    participant E as 人类工程师
    participant W as Record 工作稿
    participant T as 测试工具 / 环境

    rect rgb(238, 246, 255)
    Note over U,A: 阶段一：从测试用例生成实施指南
    U->>A: 已完成测试用例，请设计测试实施指南
    A->>R: start target=execution_guide
    A->>A: 读取测试用例、模板、skill
    A->>G: 生成实施指南草稿
    A->>G: 所有 case 都进入指南
    A->>G: 标注每个 case 的环境、工具、输入、断言、证据、阻塞项
    A->>R: complete / validate
    R-->>A: 门禁结果
    A-->>U: 交付实施指南
    end

    rect rgb(255, 247, 237)
    Note over U,E: 阶段二：人类确认阻塞项
    U->>E: 确认工具能力、mock 能力、业务口径、测试数据等
    E-->>U: 确认哪些阻塞已解决
    U->>A: 阻塞项已确认，开始执行测试
    end

    rect rgb(236, 253, 245)
    Note over A,W: 阶段三：执行前先生成 Record 工作稿
    A->>A: 检查是否已有可执行实施指南
    A->>A: 逐 case 检查阻塞项
    A->>R: start target=execution_record
    A->>W: 生成 Record 工作稿骨架
    A->>W: 所有 case 入稿：待执行 / 阻塞 / 不执行 / 部分覆盖
    end

    loop 逐 case 执行
        A->>A: 检查当前 case 是否仍有阻塞项

        alt case 仍阻塞
            A->>W: 写入阻塞状态、原因、需谁确认、解决动作、验收标准
            A-->>U: 说明该 case 暂不执行
        else case 无阻塞
            A->>T: 执行当前 case
            T-->>A: 返回日志、报告、关键业务 ID、证据
            A->>W: 立即更新该 case 明细
            A->>W: 写入环境、工具、输入、关键 ID、断言、证据、结论
        end

        alt 长周期 / 跨日 case
            A->>W: 先写入输入信息、关键 ID、启动时间
            A->>W: 写入观察节点 T0 / T1 / T2
            A->>W: 写入每个节点要检查的断言和证据要求
            A-->>U: 当前 case 进入待观察，可换 agent 续查
            U->>A: 下一轮继续检查该 case
            A->>W: 读取前轮输入、关键 ID、观察节点
            A->>T: 检查下一观察点证据
            A->>W: 补充观察结果、断言、证据、下一步动作
        end
    end

    rect rgb(245, 243, 255)
    Note over A,U: 阶段四：最终报告
    A->>W: 确认可执行 case 都已处理
    A->>A: 从 Record 提炼最终摘要
    A-->>U: 输出最终报告 / 团队报告草稿
    end
```

## 协作节点

| 协作节点 | Agent 做什么 | 人类做什么 | 产物状态 |
| --- | --- | --- | --- |
| 生成实施指南 | 把所有 case 转成可执行步骤，标阻塞项 | 审核方向是否合理 | `test_execution_guide.md` |
| 阻塞确认 | 列出工具、mock、业务口径、数据等待确认项 | 确认是否具备执行条件 | case 从 `阻塞` 变 `待执行` |
| 开始执行 | 启动 Runner，先生成 Record 工作稿 | 不需要手工整理报告 | `execution_record.md` |
| 执行普通 case | 执行一个，更新一个 | 看结果或补充判断 | case 有证据和结论 |
| 执行长周期 case | 先写输入、关键 ID、观察节点 | 后续可换人继续 | case 可续跑 |
| 生成最终报告 | 只从 Record 提炼 | 审核最终口径 | 最终报告 / 团队报告草稿 |

## 一句话说明

实施指南决定“怎么测”，Record 工作稿承接“测到哪了”。长周期 case 不是靠聊天上下文续跑，而是靠 Record 里的输入、关键 ID、观察节点和待补证据续跑。
