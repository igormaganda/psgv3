// Version de démonstration du portail admin PSG pour Vercel
// Cette version fonctionne sans base de données pour les tests

const demoUsers = [
  {
    id: 'admin1',
    email: 'admin@psg.com',
    password: 'Admin#2026!', // En production, utiliser bcrypt hash
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    active: true
  },
  {
    id: 'emp1',
    email: 'jason.walker@psg.local',
    password: 'Employee#2026!',
    role: 'employee',
    firstName: 'Jason',
    lastName: 'Walker',
    active: true
  }
];

// Mock des fonctions API pour la démo
export const mockLogin = (email, password) => {
  const user = demoUsers.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: 'demo-token-' + Date.now(),
      passwordDaysLeft: 180,
      mustChangePassword: false
    };
  }
  throw new Error('Invalid credentials');
};

export const mockGetUsers = () => {
  return demoUsers.map(u => {
    const { password: _, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
};

export const mockGetStats = () => ({
  totalEmployees: 2,
  activeEmployees: 2,
  totalDocuments: 0,
  activeAdmins: 1,
  recentActivity: 3
});