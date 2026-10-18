// Demo mode for GitHub Pages: statistics come from JSON files exported from the API,
// accounts and watchlists are kept in localStorage.
import { getSession } from './session';

const BASE = `${import.meta.env.BASE_URL}data`;
const USERS_KEY = 'covid:demo-users';
const cache = new Map();

const load = (file) => {
  if (!cache.has(file)) {
    cache.set(
      file,
      fetch(`${BASE}/${file}`).then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'No data for this location' : 'Could not load data');
        return res.json();
      })
    );
  }
  return cache.get(file);
};

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
};

const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const currentUser = () => {
  const username = getSession()?.user?.username;
  const user = username && readUsers()[username];
  if (!user) throw new Error('Authentication required');
  return { username, ...user };
};

const watchlistFor = async (codes) => {
  const countries = await load('countries.json');
  return codes.map((code) => countries.find((c) => c.isoCode === code)).filter(Boolean);
};

const validate = (username, password) => {
  if (!username || username.trim().length < 3) throw new Error('Username must be 3–40 characters long');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long');
};

export const staticApi = {
  summary: () => load('summary.json'),
  countries: () => load('countries.json'),
  vaccinations: (isoCode) => load(`vaccinations/${isoCode.toUpperCase()}.json`),
  hospitalizations: (isoCode) => load(`hospitalizations/${isoCode.toUpperCase()}.json`),

  async register(username, password) {
    validate(username, password);
    const users = readUsers();
    if (users[username]) throw new Error('This username is already taken');
    users[username] = { password, watchlist: ['POL'] };
    writeUsers(users);
    return { token: `demo:${username}`, user: { username } };
  },

  async login(username, password) {
    const users = readUsers();
    if (username === 'demo' && !users.demo) {
      users.demo = { password: 'demo123', watchlist: ['POL', 'DEU', 'GBR'] };
      writeUsers(users);
    }
    if (users[username]?.password !== password) throw new Error('Invalid username or password');
    return { token: `demo:${username}`, user: { username } };
  },

  async watchlist() {
    return watchlistFor(currentUser().watchlist);
  },

  async watch(isoCode) {
    const user = currentUser();
    const users = readUsers();
    users[user.username].watchlist = [...new Set([...user.watchlist, isoCode.toUpperCase()])];
    writeUsers(users);
    return watchlistFor(users[user.username].watchlist);
  },

  async unwatch(isoCode) {
    const user = currentUser();
    const users = readUsers();
    users[user.username].watchlist = user.watchlist.filter((code) => code !== isoCode.toUpperCase());
    writeUsers(users);
    return watchlistFor(users[user.username].watchlist);
  },
};
