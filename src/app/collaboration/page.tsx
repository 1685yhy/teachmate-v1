"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users,
  GitCompare,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Share2,
  Download
} from 'lucide-react';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState<'comparison' | 'collective'>('comparison');
  const [showCreateComparison, setShowCreateComparison] = useState(false);
  const [showCreateCollective, setShowCreateCollective] = useState(false);
  
  // 从本地存储加载数据
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [collectiveTasks, setCollectiveTasks] = useState<any[]>([]);

  useEffect(() => {
    const comparisons = JSON.parse(localStorage.getItem('comparison_history') || '[]');
    const tasks = JSON.parse(localStorage.getItem('collective_tasks') || '[]');
    if (comparisons.length > 0) {
      setComparisonData(comparisons);
    } else {
      // 默认示例数据
      setComparisonData([
    {
      id: '1',
      teachers: ['王老师', '李老师'],
      theme: '背影',
      subject: '语文',
      grade: '八年级',
      date: '2024-01-15',
      comparisons: [
        {
          dimension: '导入方式',
          teacher1: '亲情故事导入（情感切入）',
          teacher2: '作者生平导入（背景切入）',
        },
        {
          dimension: '核心问题链',
          teacher1: '父亲为什么穿黑布大褂？→ 体现了什么？→ 你的父亲呢？',
          teacher2: '文章写了几次流泪？→ 原因分别是什么？→ 情感变化？',
        },
        {
          dimension: '学生活动',
          teacher1: '角色扮演"车站送别"',
          teacher2: '小组讨论"细节描写作用"',
        },
        {
          dimension: '时间分配',
          teacher1: '导入5\' 新授25\' 活动10\' 总结5\'',
          teacher2: '导入3\' 新授20\' 讨论15\' 写作7\'',
        },
      ],
      aiAnalysis: {
        teacher1: '情感体验深，但文本分析稍弱',
        teacher2: '文本分析扎实，但情感共鸣不足',
        suggestion: '建议融合：先用李的方法分析文本，再用王的方法升华情感'
      }
    }
  ]);
    }
    setCollectiveTasks(tasks);
  }, []);

  return (
    <>
      <Header title="教研协作平台（V1.5）" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab 切换 */}
          <div className="flex items-center space-x-4 mb-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => setActiveTab('comparison')}
              className={cn(
                "flex-1 py-3 px-6 rounded-xl font-bold transition-all",
                activeTab === 'comparison'
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <GitCompare size={20} className="inline mr-2" />
              同课异构对比
            </button>
            <button
              onClick={() => setActiveTab('collective')}
              className={cn(
                "flex-1 py-3 px-6 rounded-xl font-bold transition-all",
                activeTab === 'collective'
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Users size={20} className="inline mr-2" />
              集体备课
            </button>
          </div>

          {activeTab === 'comparison' && (
            <div className="space-y-6">
              {/* 同课异构对比列表 */}
              {comparisonData.map((comparison) => (
                <div key={comparison.id} className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2">
                        《{comparison.theme}》同课异构分析
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{comparison.subject} · {comparison.grade}</span>
                        <span>{comparison.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Share2 size={20} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>

                  {/* 对比表格 */}
                  <div className="mb-6 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-black text-gray-700">对比维度</th>
                          <th className="text-center py-3 px-4 font-black text-blue-600">{comparison.teachers[0]}</th>
                          <th className="text-center py-3 px-4 font-black text-purple-600">{comparison.teachers[1]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.comparisons.map((comp, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 font-bold text-gray-700">{comp.dimension}</td>
                            <td className="py-4 px-4 text-sm text-gray-600 text-center">{comp.teacher1}</td>
                            <td className="py-4 px-4 text-sm text-gray-600 text-center">{comp.teacher2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* AI 分析结论 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                    <h4 className="font-black text-gray-900 mb-4 flex items-center space-x-2">
                      <MessageSquare className="text-blue-600" size={20} />
                      <span>AI 分析结论</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-xl">
                        <div className="text-sm font-bold text-blue-600 mb-1">{comparison.teachers[0]}：</div>
                        <div className="text-sm text-gray-700">{comparison.aiAnalysis.teacher1}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl">
                        <div className="text-sm font-bold text-purple-600 mb-1">{comparison.teachers[1]}：</div>
                        <div className="text-sm text-gray-700">{comparison.aiAnalysis.teacher2}</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                        <div className="text-sm font-bold text-yellow-800 mb-1">💡 融合建议：</div>
                        <div className="text-sm text-yellow-900">{comparison.aiAnalysis.suggestion}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 创建新对比 */}
              <button 
                onClick={() => setShowCreateComparison(true)}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Plus size={32} />
                </div>
                <span className="font-bold text-gray-700">创建新的同课异构对比</span>
                <span className="text-sm text-gray-500">邀请同事一起参与对比分析</span>
              </button>

              {/* 创建对比弹窗 */}
              {showCreateComparison && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">创建同课异构对比</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">课题名称</label>
                        <input type="text" placeholder="例如：背影" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">学科</label>
                          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none">
                            <option>语文</option>
                            <option>数学</option>
                            <option>英语</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">年级</label>
                          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none">
                            <option>八年级</option>
                            <option>七年级</option>
                            <option>九年级</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">参与教师（至少2位）</label>
                        <input type="text" placeholder="输入教师姓名，用逗号分隔" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                      <div className="flex items-center space-x-4 pt-4">
                        <button 
                          onClick={() => {
                            // 保存到本地存储
                            const newComparison = {
                              id: Date.now().toString(),
                              teachers: ['王老师', '李老师'],
                              theme: '新课题',
                              subject: '语文',
                              grade: '八年级',
                              date: new Date().toISOString(),
                              comparisons: [],
                              aiAnalysis: {
                                teacher1: '待分析',
                                teacher2: '待分析',
                                suggestion: '请上传教案后进行AI分析'
                              }
                            };
                            const history = JSON.parse(localStorage.getItem('comparison_history') || '[]');
                            const updated = [newComparison, ...history].slice(0, 20);
                            localStorage.setItem('comparison_history', JSON.stringify(updated));
                            setComparisonData([newComparison, ...comparisonData]);
                            setShowCreateComparison(false);
                            alert('创建成功！请邀请教师上传教案进行对比。');
                          }}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                          创建
                        </button>
                        <button 
                          onClick={() => setShowCreateComparison(false)}
                          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collective' && (
            <div className="space-y-6">
              {/* 集体备课任务列表 */}
              {collectiveTasks.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
                  <h3 className="text-xl font-black text-gray-900 mb-6">进行中的备课任务</h3>
                  <div className="space-y-4">
                    {collectiveTasks.map((task) => (
                      <div key={task.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-black text-gray-900">{task.theme}</h4>
                            <div className="text-sm text-gray-500 mt-1">{task.subject} · {task.grade}</div>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            task.status === 'preparing' ? "bg-yellow-100 text-yellow-700" :
                            task.status === 'discussing' ? "bg-blue-100 text-blue-700" :
                            "bg-green-100 text-green-700"
                          )}>
                            {task.status === 'preparing' ? '个人初备中' :
                             task.status === 'discussing' ? '集体研讨中' : '已完成'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          创建时间：{new Date(task.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 集体备课工作流说明 */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6">集体备课工作流</h3>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: '备课组长创建备课任务',
                      desc: '设定课题、时间、参与人员，上传参考资料',
                      icon: Plus,
                      color: 'blue'
                    },
                    {
                      step: 2,
                      title: '个人初备阶段（2天）',
                      desc: '每位教师独立设计教案，上传到平台，AI初步评估',
                      icon: FileText,
                      color: 'green'
                    },
                    {
                      step: 3,
                      title: '集体研讨阶段（教研会）',
                      desc: '平台展示所有教案对比，AI识别共识与分歧，在线讨论，形成优化建议',
                      icon: Users,
                      color: 'purple'
                    },
                    {
                      step: 4,
                      title: '个性化修改阶段（1天）',
                      desc: '教师根据建议修改教案，AI提供个性化优化建议',
                      icon: CheckCircle2,
                      color: 'orange'
                    },
                    {
                      step: 5,
                      title: '成果沉淀阶段',
                      desc: '形成最终教案集，评选优秀设计，纳入校本资源库',
                      icon: Download,
                      color: 'indigo'
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-2xl">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl flex-shrink-0",
                        `bg-${item.color}-600`
                      )}>
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <item.icon className={cn(`text-${item.color}-600`)} size={20} />
                          <h4 className="font-black text-gray-900">{item.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 创建新备课任务 */}
              <button 
                onClick={() => setShowCreateCollective(true)}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Plus size={32} />
                </div>
                <span className="font-bold text-gray-700">创建新的集体备课任务</span>
                <span className="text-sm text-gray-500">组织教研组进行协作备课</span>
              </button>

              {/* 创建集体备课弹窗 */}
              {showCreateCollective && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">创建集体备课任务</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">课题名称</label>
                        <input type="text" placeholder="例如：一元一次方程" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">学科</label>
                          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none">
                            <option>数学</option>
                            <option>语文</option>
                            <option>英语</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">年级</label>
                          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none">
                            <option>七年级</option>
                            <option>八年级</option>
                            <option>九年级</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">参与人员</label>
                        <input type="text" placeholder="输入教师姓名，用逗号分隔" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">个人初备截止时间</label>
                          <input type="date" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">集体研讨时间</label>
                          <input type="datetime-local" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">参考资料（可选）</label>
                        <textarea placeholder="上传参考资料或说明..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-blue-100 outline-none resize-none" />
                      </div>
                      <div className="flex items-center space-x-4 pt-4">
                        <button 
                          onClick={() => {
                            const newTask = {
                              id: Date.now().toString(),
                              theme: '新课题',
                              subject: '数学',
                              grade: '七年级',
                              participants: [],
                              status: 'preparing',
                              date: new Date().toISOString(),
                            };
                            const history = JSON.parse(localStorage.getItem('collective_tasks') || '[]');
                            const updated = [newTask, ...history].slice(0, 20);
                            localStorage.setItem('collective_tasks', JSON.stringify(updated));
                            setCollectiveTasks([newTask, ...collectiveTasks]);
                            setShowCreateCollective(false);
                            alert('集体备课任务创建成功！');
                          }}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                          创建任务
                        </button>
                        <button 
                          onClick={() => setShowCreateCollective(false)}
                          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

