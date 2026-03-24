export const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export const calculateProgress = (tasks) => {
  if (!tasks.length) {
    return 0;
  }

  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  return Math.round((completedTasks / tasks.length) * 100);
};
