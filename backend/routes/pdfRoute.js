import { Router } from "express";
import { pdfDelete } from "../controller/pdf/pdfDelete.js";
import { pdfGet } from "../controller/pdf/pdfGet.js";
import { pdfUpload } from "../controller/pdf/pdfUpload.js";

const pdfRoute = Router();  

pdfRoute.post("/pdfUpload", pdfUpload);
pdfRoute.get("/pdfGet", pdfGet);
pdfRoute.delete("/pdfDelete/:pdf_id", pdfDelete);

export default pdfRoute;