import { supabase } from './supabase'
import { todayKey } from '../constants'

export async function fetchAppState(userId) {
  const [
    habitsRes, logsRes, savingsRes, mealsRes,
    workoutsRes, wLogsRes, invRes, invLogRes, profileRes,
  ] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('habit_logs').select('*').eq('user_id', userId).eq('log_date', todayKey),
    supabase.from('savings').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('meals').select('*').eq('user_id', userId),
    supabase.from('workouts').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('workout_logs').select('*').eq('user_id', userId),
    supabase.from('inventory').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('inventory_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    supabase.from('profiles').select('diet_plan, selected_day, progress_history').eq('id', userId).single(),
  ])

  const habitLogsToday = logsRes.data || []
  const workoutLogs    = wLogsRes.data || []
  const profile        = profileRes.data || {}

  const habits = (habitsRes.data || []).map(h => ({
    id:        h.id,
    name:      h.name,
    cat:       h.cat,
    streak:    h.streak || 0,
    history:   h.history || {},
    doneToday: habitLogsToday.some(l => l.habit_id === h.id && l.done),
  }))

  const savings = (savingsRes.data || []).map(s => ({
    id:       s.id,
    name:     s.name,
    goal:     parseFloat(s.goal),
    current:  parseFloat(s.current_amount) || 0,
    deadline: s.deadline || '',
  }))

  const meals = {}
  ;(mealsRes.data || []).forEach(m => {
    if (!meals[m.day_of_week]) meals[m.day_of_week] = {}
    meals[m.day_of_week][m.slot] = { food: m.food || '', time: m.time || '' }
  })

  const workouts = (workoutsRes.data || []).map(w => ({
    id:    w.id,
    name:  w.name,
    days:  w.days || [],
    color: w.color || '#185FA5',
    done:  workoutLogs.filter(l => l.workout_id === w.id).map(l => l.log_date),
  }))

  const inventory = (invRes.data || []).map(p => ({
    id:   p.id,
    name: p.name,
    cat:  p.cat,
    unit: p.unit,
    qty:  parseFloat(p.qty) || 0,
    max:  parseFloat(p.max_qty) || 100,
  }))

  const invLog = (invLogRes.data || []).map(l => ({
    id:   l.id,
    name: l.item_name,
    type: l.move_type,
    qty:  l.qty,
    unit: l.unit,
    note: l.note || '',
    date: l.log_date || '',
  }))

  return {
    habits,
    savings,
    meals,
    workouts,
    inventory,
    invLog,
    invFilter:       'todos',
    dietPlan:        profile.diet_plan || null,
    selectedDay:     profile.selected_day ?? new Date().getDay(),
    progressHistory: profile.progress_history || {},
    lastResetDate:   todayKey,
  }
}
