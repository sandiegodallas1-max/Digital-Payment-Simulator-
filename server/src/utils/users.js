import { getUsers } from "../data/store.js";

export function listUsers() {
  return getUsers();
}
