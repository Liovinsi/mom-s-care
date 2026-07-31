const developmentAccounts = [
  {
    loginId: "admin@pgstay.com",
    password: "admin123",
    token: "dev-token-admin",
    user: {
      id: "dev-admin",
      name: "Admin",
      email: "admin@pgstay.com",
      role: "Admin"
    }
  },
  {
    loginId: "warden@pgstay.com",
    password: "warden123",
    token: "dev-token-warden-wd001",
    user: {
      id: "dev-warden-wd001",
      name: "Demo Warden",
      email: "warden@pgstay.com",
      employeeId: "WARDEN",
      role: "Warden",
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
      name: "Demo User",
      email: "demo@gmail.com",
      role: "User"
    }
  }
];

const normalizeLoginId = (loginId) => loginId.trim().toLowerCase();

const socialAccounts = {
  google: {
    token: "dev-token-google-guest",
    user: {
      id: "demo-google-guest",
      name: "Demo User",
      email: "demo@gmail.com",
      role: "User",
      provider: "google"
    }
  },
  facebook: {
    token: "dev-token-facebook-guest",
    user: {
      id: "demo-facebook-guest",
      name: "Demo User",
      email: "demo@facebook.com",
      role: "User",
      provider: "facebook"
    }
  }
};

export const authenticate = async ({ loginId, password }) => {
  const value = String(loginId || "").trim();
  if (!value) throw new Error("Login ID / Email is required.");
  if (!password) throw new Error("Password is required.");

  const account = developmentAccounts.find((item) => (
    normalizeLoginId(item.loginId) === normalizeLoginId(value) && item.password === password
  ));

  if (!account) {
    if (normalizeLoginId(value) === "warden@pgstay.com") throw new Error("Invalid Warden email or password.");
    if (normalizeLoginId(value) === "admin@pgstay.com") throw new Error("Invalid Admin email or password.");
    throw new Error("Invalid staff email or password.");
  }

  return {
    token: account.token,
    user: account.user
  };
};

export const authenticateSocial = async (provider) => {
  const account = socialAccounts[provider];
  if (!account) throw new Error("Unsupported social login provider.");
  return account;
};
