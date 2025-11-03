import { RequestHandler } from "express";

export const handleDemo: RequestHandler = (req, res) => {
  res.json({ message: "Demo endpoint working" });
};
    message: "Hello from Express server",
  };
  res.status(200).json(response);
};
