import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AchievementBadge } from '@/components/AchievementBadge'
import { SkillProgressTree } from '@/components/SkillProgressTree'
import { LearningRecommendations } from '@/components/LearningRecommendations'
import { EnhancedAnalytics } from '@/components/EnhancedAnalytics'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, TrendingUp, BookOpen, Award, BarChart3 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  badge_color: string
  earned_at?: string
  progress?: number
}

interface UserAchievement {
  achievement_id: string
  earned_at: string
  progress: number
}

interface SkillProgress {
  domain: string
  skill_name: string
  current_level: number
  experience_points: number
  mastery_percentage: number
}

interface LearningRecommendation {
  id: string
  domain: string
  recommendation_type: string
  title: string
  description: string
  priority: number
  resource_links?: any
  is_completed: boolean
  created_at: string
}

export default function NewUserPerformance() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([])
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  // Mock analytics data - in a real app, this would come from the database
  const analyticsData = {
    totalAssessments: 12,
    averageScore: 78.5,
    totalTimeSpent: 450, // minutes
    improvementTrend: 5.2,
    streakDays: 7,
    domainPerformance: [
      { domain: 'JavaScript', score: 85, assessments: 4 },
      { domain: 'React', score: 78, assessments: 3 },
      { domain: 'Node.js', score: 72, assessments: 2 },
      { domain: 'Python', score: 81, assessments: 3 }
    ],
    recentScores: [
      { date: '2024-01-01', score: 65 },
      { date: '2024-01-02', score: 70 },
      { date: '2024-01-03', score: 75 },
      { date: '2024-01-04', score: 80 },
      { date: '2024-01-05', score: 85 }
    ],
    weeklyActivity: [
      { day: 'Mon', assessments: 2 },
      { day: 'Tue', assessments: 1 },
      { day: 'Wed', assessments: 3 },
      { day: 'Thu', assessments: 2 },
      { day: 'Fri', assessments: 1 },
      { day: 'Sat', assessments: 0 },
      { day: 'Sun', assessments: 1 }
    ]
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('category')

      // Fetch user achievements
      const { data: userAchievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)

      // Fetch skill progress
      const { data: skillProgressData } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', user.id)

      // Fetch learning recommendations
      const { data: recommendationsData } = await supabase
        .from('learning_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('priority')

      setAchievements(achievementsData || [])
      setUserAchievements(userAchievementsData || [])
      setSkillProgress(skillProgressData || [])
      setRecommendations(recommendationsData || [])

      // Insert mock data if empty
      if (skillProgressData?.length === 0) {
        await insertMockData(user.id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load performance data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const insertMockData = async (userId: string) => {
    try {
      // Insert mock skill progress
      const mockSkills = [
        { user_id: userId, domain: 'JavaScript', skill_name: 'ES6 Features', current_level: 3, experience_points: 250, mastery_percentage: 75.5 },
        { user_id: userId, domain: 'JavaScript', skill_name: 'Async/Await', current_level: 2, experience_points: 150, mastery_percentage: 60.0 },
        { user_id: userId, domain: 'React', skill_name: 'Hooks', current_level: 4, experience_points: 320, mastery_percentage: 88.0 },
        { user_id: userId, domain: 'React', skill_name: 'State Management', current_level: 2, experience_points: 120, mastery_percentage: 55.0 },
        { user_id: userId, domain: 'Node.js', skill_name: 'Express.js', current_level: 3, experience_points: 200, mastery_percentage: 70.0 },
        { user_id: userId, domain: 'Python', skill_name: 'Data Structures', current_level: 5, experience_points: 450, mastery_percentage: 95.0 }
      ]

      await supabase.from('skill_progress').insert(mockSkills)

      // Insert mock recommendations
      const mockRecommendations = [
        {
          user_id: userId,
          domain: 'JavaScript',
          recommendation_type: 'skill_gap',
          title: 'Master Promises and Async Programming',
          description: 'Your async/await scores suggest you could benefit from deeper understanding of Promise-based programming.',
          priority: 1,
          resource_links: [
            { title: 'MDN Promises Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises' },
            { title: 'JavaScript.info Async', url: 'https://javascript.info/async' }
          ]
        },
        {
          user_id: userId,
          domain: 'React',
          recommendation_type: 'next_level',
          title: 'Advanced State Management Patterns',
          description: 'Ready to learn advanced patterns like useReducer and Context API for complex state management.',
          priority: 2,
          resource_links: [
            { title: 'React Docs - useReducer', url: 'https://react.dev/reference/react/useReducer' }
          ]
        }
      ]

      await supabase.from('learning_recommendations').insert(mockRecommendations)

      // Award some achievements
      const firstAchievement = achievements.find(a => a.name === 'First Steps')
      if (firstAchievement) {
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: firstAchievement.id,
          progress: 100
        })
      }

      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error inserting mock data:', error)
    }
  }

  const totalPoints = userAchievements.reduce((total, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievement_id)
    return total + (achievement?.points || 0)
  }, 0)

  const achievementsWithStatus = achievements.map(achievement => ({
    ...achievement,
    isEarned: userAchievements.some(ua => ua.achievement_id === achievement.id),
    progress: userAchievements.find(ua => ua.achievement_id === achievement.id)?.progress || 0
  }))

  if (loading) {
    return (
      <Card className="bright-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your performance data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bright-card">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
          </CardContent>
        </Card>
        
        <Card className="bright-card">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>
        
        <Card className="bright-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{skillProgress.length}</div>
            <div className="text-sm text-muted-foreground">Skills Tracked</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <EnhancedAnalytics data={analyticsData} />
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Your Achievements</h2>
              <p className="text-muted-foreground mb-4">
                Unlock badges by completing assessments and improving your skills
              </p>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Award className="w-4 h-4 mr-2" />
                  {userAchievements.length} / {achievements.length} Unlocked
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  {totalPoints} Points
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {achievementsWithStatus.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  isEarned={achievement.isEarned}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Skill Progress</h2>
              <p className="text-muted-foreground">
                Track your mastery across different technology domains
              </p>
            </div>
            
            {skillProgress.length > 0 ? (
              <SkillProgressTree skills={skillProgress} />
            ) : (
              <Card className="bright-card">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Skills Tracked Yet</h3>
                  <p className="text-muted-foreground">
                    Complete some assessments to start tracking your skill progress!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Learning Recommendations</h2>
              <p className="text-muted-foreground">
                Personalized suggestions to improve your skills
              </p>
            </div>
            
            <LearningRecommendations 
              recommendations={recommendations} 
              onUpdate={fetchData}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}