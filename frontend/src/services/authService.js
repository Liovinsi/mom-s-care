const developmentAccounts = [
  {
    loginId: "admin@pgstay.com",
    password: "Admin@123",
    token: "dev-token-admin",
    user: {
      id: "dev-admin",
      name: "Admin",
      email: "admin@pgstay.com",
      role: "ADMIN"
    }
  },
  {
    loginId: "WD001",
    password: "Temp@123",
    token: "dev-token-warden-wd001",
    user: {
      id: "dev-warden-wd001",
      name: "Arun Kumar",
      employeeId: "WD001",
      role: "WARDEN",
      branchId: "anna-nagar",
      branchName: "Anna Nagar"
    }
  },
  {
    loginId: "user@pgstay.com",
    password: "User@123",
    token: "dev-token-user",
    user: {
      id: "dev-user",
      name: "User",
      email: "user@pgstay.com",
      role: "USER"
    }
  }
];

const normalizeLoginId = (loginId) => loginId.trim().toLowerCase();

// Local development only. Replace this service with API-backed authentication
// when the database and backend auth flow are connected.
export const authenticate = async ({ loginId, password }) => {
  const value = String(loginId || "").trim();
  if (!value) throw new Error("Login ID / Email is required.");
  if (!password) throw new Error("Password is required.");

  const account = developmentAccounts.find((item) => (
    normalizeLoginId(item.loginId) === normalizeLoginId(value) && item.password === password
  ));

  if (!account) {
    if (value.toUpperCase().startsWith("WD")) throw new Error("Invalid Warden Employee ID or password.");
    throw new Error("Invalid email or password.");
  }

  return {
    token: account.token,
    user: account.user
  };
};
