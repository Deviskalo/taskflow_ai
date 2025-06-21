import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  CheckSquare,
  LogOut,
  User,
  Bot,
  Bell,
  BarChart3,
  FileText,
  Zap,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { useNotifications } from "../hooks/useNotifications";
import { TaskStats } from "../components/TaskStats";
import { TaskFilters } from "../components/TaskFilters";
import { TaskList } from "../components/TaskList";
import { SmartTaskForm } from "../components/SmartTaskForm";
import { AIAssistant } from "../components/AIAssistant";
import { NotificationCenter } from "../components/NotificationCenter";
import { TaskAnalytics } from "../components/TaskAnalytics";
import { TaskTemplates } from "../components/TaskTemplates";
import { QuickActions } from "../components/QuickActions";
import { BottomNavigation } from "../components/BottomNavigation";
import { Profile } from "../components/Profile";
import { Task } from "../types/Task";
import { Button } from "@/components/ui/button";

type TabType = "dashboard" | "analytics" | "notifications" | "profile";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Task management
  const {
    tasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    taskStats,
  } = useTasks();

  // Notifications
  const {
    notifications,
    notificationsEnabled,
    requestPermission,
    showNotificationBanner,
    dismissNotificationBanner,
    removeNotification,
  } = useNotifications(tasks);

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  // Removed unused showNotifications state
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedTasks] = useState<string[]>([]);

  // Handlers
  const handleAddTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/task/${task.id}`);
  };

  const handleSelectTask = (taskId: string) => {
    // No-op since we're not using task selection for now
    console.log("Task selected:", taskId);
  };

  const handleSaveTask = async (
    taskData: Omit<Task, "id" | "created_at" | "updated_at" | "user_id"> & {
      due_date?: string;
    }
  ) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask({
        ...taskData,
        due_date: taskData.due_date || new Date().toISOString(),
        status: taskData.status || "pending",
      });
    }
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleBulkStatusChange = (
    taskIds: string[],
    status: "pending" | "in-progress" | "completed"
  ) => {
    taskIds.forEach((id) => updateTaskStatus(id, status));
  };

  const handleBulkDelete = (taskIds: string[]) => {
    taskIds.forEach((id) => handleDeleteTask(id));
  };

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
            <p className="text-gray-600 mb-6">Your productivity insights</p>
            <TaskAnalytics tasks={tasks} />
          </div>
        );

      case "notifications":
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Notifications
            </h2>
            <p className="text-gray-600 mb-6">Stay updated with your tasks</p>
            <NotificationCenter
              notifications={notifications}
              onClose={() => {
                /* No-op since we don't have a showNotifications state */
              }}
              onRemove={(id) => removeNotification(id)}
            />
          </div>
        );

      case "profile":
        return <Profile onSignOut={handleSignOut} isMobile={isMobile} />;

      case "dashboard":
      default:
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
                <p className="text-gray-600">
                  Manage your daily tasks and activities
                </p>
              </div>
              {!isMobile && (
                <button
                  onClick={handleAddTask}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Task</span>
                </button>
              )}
            </div>

            <TaskFilters filters={filters} onFiltersChange={setFilters} />
            <div className="my-6">
              <TaskStats stats={taskStats} />
            </div>
            <TaskList
              tasks={tasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={updateTaskStatus}
              onTaskClick={handleTaskClick}
            />
          </div>
        );
    }
  };

  const displayName = userProfile?.name || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TaskFlow AI</h1>
              <p className="text-sm text-gray-600">Hi, {displayName}!</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowTemplates(true)}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"
            >
              <FileText className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsAIAssistantOpen(true)}
              className="p-2 bg-purple-50 text-purple-600 rounded-lg"
            >
              <Bot className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setShowQuickActions(true)}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"
            >
              <Zap className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen">
        <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">TaskFlow AI</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center mb-6 gap-1">
            <Button
              onClick={() => setShowTemplates(true)}
              className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              size="icon"
              title="Templates"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsAIAssistantOpen(true)}
              className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              size="icon"
              title="AI Assistant"
            >
              <Bot className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowQuickActions(true)}
              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              size="icon"
              title="Quick Actions"
            >
              <Zap className="w-4 h-4" />
            </Button>
          </div>

          <nav className="space-y-1.5 flex-1">
            <Button
              onClick={() => handleTabChange("dashboard")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
                activeTab === "dashboard"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 flex-shrink-0" />
                <span>Tasks</span>
              </div>
            </Button>

            <Button
              onClick={() => handleTabChange("analytics")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
                activeTab === "analytics"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <span>Analytics</span>
              </div>
            </Button>

            <Button
              onClick={() => handleTabChange("notifications")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
                activeTab === "notifications"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 flex-shrink-0" />
                <span>Notifications</span>
              </div>
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                  {notifications.length}
                </span>
              )}
            </Button>

            <Button
              onClick={() => handleTabChange("profile")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
                activeTab === "profile"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 flex-shrink-0" />
                <span>Profile</span>
              </div>
            </Button>
          </nav>

          <div className="pt-6 border-t border-gray-200">
            <Button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{renderContent()}</div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden">
        {renderContent()}

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAddTask={handleAddTask}
          notificationCount={notifications.length}
        />
      </div>

      {/* Modals */}
      <SmartTaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTask}
      />

      <AIAssistant
        tasks={tasks}
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onTaskSuggestion={(suggestion) => {
          // Handle AI task suggestion
          console.log("AI Task Suggestion:", suggestion);
        }}
      />

      <TaskTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onUseTemplate={(template) => {
          handleSaveTask({
            ...template,
            status: "pending" as const,
            due_date: new Date().toISOString(),
          });
        }}
      />

      <QuickActions
        tasks={tasks}
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={handleBulkDelete}
        onBulkReschedule={(taskIds, days) => {
          // Implement bulk reschedule logic here
          console.log(`Rescheduling tasks ${taskIds} by ${days} days`);
        }}
        selectedTasks={selectedTasks}
        onSelectTask={handleSelectTask}
      />

      {/* Notification Banner */}
      {showNotificationBanner && !notificationsEnabled && (
        <div
          className={`${isMobile ? "fixed bottom-16 left-0 right-0 border-t border-gray-200" : "fixed bottom-6 right-6 w-80 rounded-lg shadow-lg"} bg-white p-4 z-50`}
        >
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Enable Notifications
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Get notified about important updates and deadlines.
              </p>
              <div
                className={`mt-3 flex ${isMobile ? "space-x-3" : "space-x-2"}`}
              >
                <Button
                  onClick={requestPermission}
                  variant="default"
                  size={isMobile ? "sm" : "default"}
                  className="text-sm font-medium"
                >
                  Enable
                </Button>
                <Button
                  onClick={dismissNotificationBanner}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="text-sm font-medium"
                >
                  {isMobile ? "Dismiss" : "Maybe Later"}
                </Button>
              </div>
            </div>
            {!isMobile && (
              <button
                onClick={dismissNotificationBanner}
                className="text-gray-400 hover:text-gray-500 ml-2"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
