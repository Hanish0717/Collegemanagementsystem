import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messService from '@/services/messService';
import { menuSchema, type MenuInput } from '@/lib/validation/messSchemas';
import { zodToFormErrors } from '@/lib/validation/utils';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { 
  Calendar, Utensils, Edit2, Trash2, Check, RefreshCw, 
  ChevronLeft, ChevronRight, Copy, Plus, X, Info, Clock, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function MessMenusAdmin() {
  const qc = useQueryClient();
  const { data: menus = [], isLoading } = useQuery({ 
    queryKey: ['mess-menus'], 
    queryFn: () => messService.fetchMenus() 
  });
  
  // Weekly Navigation State
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [form, setForm] = useState<MenuInput>({ meal_date: '', meal_type: 'Lunch', food_items: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDrawer, setShowDrawer] = useState(false);

  // Generate 7 days starting from currentWeekStart
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(newStart);
  };

  const jumpToCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const createMut = useMutation({ 
    mutationFn: (payload: any) => messService.createMenu(payload), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-menus'] });
      toast.success("Menu created successfully!");
      closeDrawer();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || "Failed to create menu");
    }
  });

  const updateMut = useMutation({ 
    mutationFn: ({ id, payload }: any) => messService.updateMenu(id, payload), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-menus'] });
      toast.success("Menu updated successfully!");
      closeDrawer();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || "Failed to update menu");
    }
  });

  const deleteMut = useMutation({ 
    mutationFn: (id: string) => messService.deleteMenu(id), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-menus'] });
      toast.success("Menu deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || "Failed to delete menu");
    }
  });

  // Bulk clone week menu items to next week
  const cloneWeekMut = useMutation({
    mutationFn: async () => {
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7);
      
      // Get all menus in current week
      const currentWeekMenus = menus.filter((m: any) => {
        const mDate = new Date(m.meal_date);
        mDate.setHours(0,0,0,0);
        const end = new Date(currentWeekStart);
        end.setDate(currentWeekStart.getDate() + 6);
        end.setHours(23,59,59,999);
        return mDate >= currentWeekStart && mDate <= end;
      });

      if (currentWeekMenus.length === 0) {
        throw new Error("No menus scheduled in the current week to copy!");
      }

      // Create new menu schedules for next week
      for (const menu of currentWeekMenus) {
        const currentMenuDate = new Date(menu.meal_date);
        const diffDays = Math.round((currentMenuDate.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24));
        const newMenuDate = new Date(nextWeekStart);
        newMenuDate.setDate(nextWeekStart.getDate() + diffDays);

        const payload = {
          meal_date: formatLocalDate(newMenuDate),
          meal_type: menu.meal_type,
          food_items: menu.food_items || []
        };
        await messService.createMenu(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-menus'] });
      toast.success("Week schedule copied to next week successfully!");
      // Jump view to the next week
      const newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to clone week schedule");
    }
  });

  const openAddDrawer = (dateStr: string, mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner') => {
    setForm({ meal_date: dateStr, meal_type: mealType, food_items: [] });
    setEditingId(null);
    setErrors({});
    setShowDrawer(true);
  };

  const openEditDrawer = (m: any) => {
    setForm({ 
      meal_date: m.meal_date, 
      meal_type: m.meal_type, 
      food_items: m.food_items || [] 
    });
    setEditingId(m.id);
    setErrors({});
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditingId(null);
    setForm({ meal_date: '', meal_type: 'Lunch', food_items: [] });
    setErrors({});
  };

  const validateAndSave = () => {
    const res = menuSchema.safeParse(form);
    if (!res.success) {
      setErrors(zodToFormErrors(res.error));
      toast.error("Please resolve the validation errors");
      return;
    }
    setErrors({});

    if (editingId) {
      updateMut.mutate({ id: editingId, payload: res.data });
    } else {
      createMut.mutate(res.data);
    }
  };

  // Group menus by date and meal type for easy calendar lookup
  const menuLookup = useMemo(() => {
    const map: Record<string, Record<string, any>> = {};
    menus.forEach((m: any) => {
      const dateKey = m.meal_date; // 'YYYY-MM-DD'
      if (!map[dateKey]) map[dateKey] = {};
      map[dateKey][m.meal_type] = m;
    });
    return map;
  }, [menus]);

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'Breakfast': return <Clock className="size-3.5 text-indigo-500" />;
      case 'Lunch': return <Utensils className="size-3.5 text-emerald-500" />;
      case 'Snacks': return <Sparkles className="size-3.5 text-amber-500" />;
      case 'Dinner': return <Utensils className="size-3.5 text-rose-500" />;
      default: return <Utensils className="size-3.5" />;
    }
  };

  const getMealHeaderClass = (type: string) => {
    switch (type) {
      case 'Breakfast': return 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30';
      case 'Lunch': return 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30';
      case 'Snacks': return 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/30';
      case 'Dinner': return 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/30';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350';
    }
  };

  // Helper to determine food tags (Veg/Non-Veg) based on keywords
  const getDietTag = (items: string[]) => {
    const nonVegKeywords = ['chicken', 'egg', 'fish', 'mutton', 'pork', 'meat', 'omelette'];
    const hasNonVeg = items.some(item => 
      nonVegKeywords.some(keyword => item.toLowerCase().includes(keyword))
    );
    return hasNonVeg ? (
      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/20">Non-Veg</span>
    ) : (
      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/20">Veg</span>
    );
  };

  return (
    <div className="space-y-6 text-left relative min-h-screen">
      <PageHeader 
        title="Mess Menu Scheduler" 
        desc="Schedule, customize, and display meal options in an interactive weekly calendar grid." 
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => cloneWeekMut.mutate()}
              disabled={cloneWeekMut.isPending}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {cloneWeekMut.isPending ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Copy className="size-3.5 text-indigo-500" />
              )}
              Copy to Next Week
            </button>
            <button
              onClick={() => openAddDrawer(formatLocalDate(new Date()), 'Lunch')}
              className="px-4 py-2 bg-gradient-primary text-white rounded-xl text-xs font-bold shadow-soft hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-3.5" />
              Add Meal Slot
            </button>
          </div>
        }
      />

      {/* Week Navigation Header */}
      <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-accent transition cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-44 text-center">
            {weekDays[0].toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button 
            onClick={() => navigateWeek('next')}
            className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-accent transition cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={jumpToCurrentWeek}
            className="px-3 py-1.5 border border-slate-250 dark:border-slate-700 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            Today
          </button>
          <Badge tone="info" className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            Weekly View
          </Badge>
        </div>
      </Card>

      {/* weekly scheduler grid layout */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed rounded-3xl">
          <RefreshCw className="size-8 animate-spin text-indigo-500" />
          <span className="text-sm text-muted-foreground">Loading calendar data...</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dateStr = formatLocalDate(day);
            const dailyMeals = menuLookup[dateStr] || {};
            const isToday = new Date().toDateString() === day.toDateString();

            return (
              <div key={dateStr} className={`space-y-3 rounded-2xl p-2.5 border transition-all ${
                isToday 
                  ? 'border-indigo-500/80 bg-indigo-500/5 shadow-md shadow-indigo-500/5' 
                  : 'border-slate-200/80 dark:border-slate-800 bg-background/40'
              }`}>
                {/* Date header */}
                <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`}>
                    {day.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </div>
                  <div className={`text-base font-extrabold mt-0.5 ${isToday ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Meals slots lists (Breakfast, Lunch, Snacks, Dinner) */}
                <div className="space-y-2.5">
                  {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map((mealType) => {
                    const scheduledMeal = dailyMeals[mealType];

                    if (scheduledMeal) {
                      return (
                        <div 
                          key={mealType} 
                          className="group border border-slate-200/60 dark:border-slate-800/60 rounded-xl bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs hover:shadow-sm transition-all text-xs"
                        >
                          {/* Meal type header bar */}
                          <div className={`px-2 py-1 flex items-center justify-between border-b border-inherit ${getMealHeaderClass(mealType)}`}>
                            <span className="font-bold text-[10px] tracking-wide flex items-center gap-1.5 uppercase">
                              {getMealIcon(mealType)}
                              {mealType}
                            </span>
                            
                            {/* Hover Edit / Delete actions */}
                            <div className="hidden group-hover:flex items-center gap-1">
                              <button 
                                onClick={() => openEditDrawer(scheduledMeal)}
                                className="p-0.5 text-slate-500 hover:text-indigo-600 rounded transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="size-3" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (!confirm(`Delete ${mealType} menu for ${scheduledMeal.meal_date}?`)) return;
                                  deleteMut.mutate(scheduledMeal.id);
                                }}
                                className="p-0.5 text-slate-500 hover:text-rose-600 rounded transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </div>

                          {/* Food items list */}
                          <div className="p-2 space-y-1 text-[11px]">
                            <div className="space-y-0.5 text-slate-700 dark:text-slate-355 font-medium leading-relaxed">
                              {scheduledMeal.food_items?.map((item: string, idx: number) => (
                                <div key={idx} className="truncate">• {item}</div>
                              ))}
                            </div>
                            
                            <div className="pt-1.5 flex justify-end">
                              {getDietTag(scheduledMeal.food_items || [])}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Empty slot placeholder
                    return (
                      <button
                        key={mealType}
                        onClick={() => openAddDrawer(dateStr, mealType)}
                        className="w-full py-2.5 border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-900 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition cursor-pointer"
                      >
                        <span className="font-medium flex items-center gap-1.5">
                          <Plus className="size-3" />
                          {mealType}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer Overlay for Add/Edit Menu */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity" 
            onClick={closeDrawer}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-background border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Utensils className="size-4 text-indigo-600" />
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                  {editingId ? 'Edit Scheduled Meal' : 'Schedule New Meal'}
                </h3>
              </div>
              <button 
                onClick={closeDrawer}
                className="p-1.5 rounded-lg border hover:bg-accent transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Scheduled Date</label>
                <input 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" 
                  type="date" 
                  value={form.meal_date} 
                  onChange={e => setForm(s => ({ ...s, meal_date: e.target.value }))} 
                />
                {errors.meal_date && <div className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.meal_date}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Meal Slot Type</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" 
                  value={form.meal_type} 
                  onChange={e => setForm(s => ({ ...s, meal_type: e.target.value as any }))}
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Snacks</option>
                  <option>Dinner</option>
                </select>
                {errors.meal_type && <div className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.meal_type}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Menu Food Items (One per line)</label>
                <textarea 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none font-sans" 
                  rows={8} 
                  placeholder="e.g.&#10;Masala Dosa&#10;Sambar&#15;&#10;Coconut Chutney"
                  value={(form.food_items || []).join('\n')} 
                  onChange={e => setForm(s => ({ ...s, food_items: e.target.value.split('\n').map(l => l.trim()).filter(Boolean) }))} 
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Add clean names like 'Paneer Butter Masala' or 'Chicken Biryani'. Veg/Non-Veg labels are automatically parsed.
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-5 border-t bg-slate-50 dark:bg-slate-900/40 flex gap-3">
              <button 
                className="flex-1 py-3 bg-gradient-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-soft cursor-pointer text-center" 
                onClick={validateAndSave}
              >
                {editingId ? 'Update Schedule' : 'Confirm Slot'}
              </button>
              <button 
                className="px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-accent transition cursor-pointer" 
                onClick={closeDrawer}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
