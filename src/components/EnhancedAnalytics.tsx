import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Award, Target, Calendar, Clock, Star, BarChart3 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts"
import { cn } from "@/lib/utils"

interface AnalyticsData {
  totalAssessments: number
  averageScore: number
  totalTimeSpent: number
  improvementTrend: number
  streakDays: number
  domainPerformance: { domain: string; score: number; assessments: number }[]
  recentScores: { date: string; score: number }[]
  weeklyActivity: { day: string; assessments: number }[]
}

interface EnhancedAnalyticsProps {
  data: AnalyticsData
  className?: string
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function EnhancedAnalytics({ data, className }: EnhancedAnalyticsProps) {
  const getStreakColor = (days: number) => {
    if (days >= 30) return "text-purple-600 bg-purple-100"
    if (days >= 14) return "text-blue-600 bg-blue-100"
    if (days >= 7) return "text-green-600 bg-green-100"
    if (days >= 3) return "text-yellow-600 bg-yellow-100"
    return "text-gray-600 bg-gray-100"
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-purple-600 bg-purple-100", icon: Award }
    if (score >= 80) return { label: "Great", color: "text-blue-600 bg-blue-100", icon: Star }
    if (score >= 70) return { label: "Good", color: "text-green-600 bg-green-100", icon: Target }
    if (score >= 60) return { label: "Fair", color: "text-yellow-600 bg-yellow-100", icon: TrendingUp }
    return { label: "Needs Work", color: "text-red-600 bg-red-100", icon: TrendingDown }
  }

  const performanceLevel = getPerformanceLevel(data.averageScore)
  const PerformanceIcon = performanceLevel.icon

  return (
    <div className={cn("space-y-6", className)}>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bright-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-2xl font-bold">{data.totalAssessments}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bright-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{data.averageScore.toFixed(1)}%</p>
                  <Badge className={performanceLevel.color} variant="secondary">
                    <PerformanceIcon className="w-3 h-3 mr-1" />
                    {performanceLevel.label}
                  </Badge>
                </div>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bright-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{formatTime(data.totalTimeSpent)}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bright-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{data.streakDays}</p>
                  <Badge className={getStreakColor(data.streakDays)} variant="secondary">
                    {data.streakDays === 1 ? 'day' : 'days'}
                  </Badge>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend Chart */}
      <Card className="bright-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Score Trend
          </CardTitle>
          <CardDescription>Your assessment scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.recentScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Performance */}
        <Card className="bright-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Domain Performance
            </CardTitle>
            <CardDescription>Your performance across different domains</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.domainPerformance.map((domain, index) => (
              <div key={domain.domain} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{domain.domain}</span>
                  <div className="flex items-center gap-2">
                    <span>{domain.score.toFixed(1)}%</span>
                    <Badge variant="outline" className="text-xs">
                      {domain.assessments} tests
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={domain.score} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="bright-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Assessments completed each day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="assessments" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Insights */}
      <Card className="bright-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.improvementTrend >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Overall Trend:</span>
              <Badge 
                variant={data.improvementTrend >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {data.improvementTrend >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {data.improvementTrend >= 0 ? "Improving" : "Declining"}
                ({Math.abs(data.improvementTrend).toFixed(1)}%)
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {data.improvementTrend >= 0 ? (
                <p>Great job! Your scores have improved by {data.improvementTrend.toFixed(1)}% compared to your earlier assessments. Keep up the excellent work!</p>
              ) : (
                <p>Your scores have declined by {Math.abs(data.improvementTrend).toFixed(1)}% recently. Consider reviewing weak areas and practicing more challenging topics.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}