import { Router, Request, Response } from "express";
import multer from "multer";
import { uploadFileToDrive } from "../lib/googleDrive";
import { authRequired } from "../auth/authMiddleware";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

router.post(
  "/upload",
  authRequired,
  upload.single("file"),
  async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Arquivo não enviado." });
      }

      const { buffer, mimetype, originalname } = req.file;

      const url = await uploadFileToDrive({
        buffer,
        mimeType: mimetype,
        originalName: originalname,
      });

      return res.json({ url });
    } catch (err: any) {
      console.error("Erro no upload para o Drive:", err);

      return res.status(500).json({
        error: "Erro ao enviar arquivo para o Drive.",
        details: err?.message || String(err),
      });
    }
  }
);

export const filesRoutes = router;
