import { Router } from "express";

const router = Router();

router.get("/users", listUsers);
router.post("/users", createUser);

function listUsers() {
  return [];
}

function createUser() {
  return {};
}

export default router;
