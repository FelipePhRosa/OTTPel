import { Request, Response } from "express";
import connection from "../connection";
import ReportService from "../Services/reportService";
import { AuthRequest } from "../types/express";

export default class ReportControllers{
    constructor(private reportService = new ReportService()){}

    async createReport(req: Request, res: Response) {
        const userId = Number(req.params.userId);

        if (isNaN(userId)) {
            res.status(400).json({ error: "userID is not valid." });
            return;
        }

        try{
            const { reportTitle, categories_id, description, latitude, longitude, image } = req.body
            const user = await connection('users').where({ id: userId }).first()

            if (!user){
                res.status(404).json({ error: `User not found.`});
                return;
            }

            await this.reportService.createReport({
                 reportTitle,
                 user_id: userId,
                 categories_id,
                 description,
                 latitude,
                 longitude,
                 image 
                });

            res.status(201).json({ message: `${user.nome} create report: ${reportTitle}.` });
            return;

        } catch(error){
            res.status(500).json({ 
                message: `Error to create Report.`, 
                details: error})
            return;
        }
    }

    async aproveReport(req: AuthRequest, res: Response){
        const reportId  = Number(req.params.reportId);
        const userId  = req.user?.id

        if (isNaN(reportId) || !userId) {
            return res.status(400).json({ error: "Invalid reportId or userId." });
        }

        try{
            const user = await connection('users').where({ role: 2 }).first()
            
            if(!user){
                return res.status(404).json({
                    message: `Admin user not found.`
                })
            }

            if(user.role !== 2 || 1) {
                return res.status(403).json({
                    error: `Only Owner / Admins can approve reports.`
                })
            }

            const report = await connection('reports').where({ id: reportId }).first()
            
            if(!report){
                return res.status(404).json({
                    message: `Report not found.`
                })
            }

            if(report.status === 'aprovado'){
                return res.status(400).json({
                    error: `Report already approved.`
                });
            }

            await connection('reports')
                .where({ id: reportId })
                .update({
                    status: 'aprovado',
                    approved_by: userId
            });

            return res.status(200).json({
                message: `Report ${reportId} approved by ${user.nome}.`,
            });

        } catch(error){
            res.status(500).json({
                message: `Internal Server Error.`,
                details: error
            })
        }
    }

    async getAllReportsPending(req: Request, res: Response){
        try{
            const PendingReports = await this.reportService.getAllReportsPending();

            res.status(200).json({
                message: `All Reports Pending Informations: `,
                data: PendingReports
            });
        } catch(error){
            res.status(500).json({
                message: `Internal Server Error.`,
                details: error
            });
        }
    }

    async getAllReports(req: Request, res: Response) {
        try{
            const AllReports = await this.reportService.getAllReports();

            res.status(200).json({ 
                message: `All Reports Informations: `,
                data: AllReports
            });

            return;
        } catch(error){
            res.status(500).json({ 
                message: `Internal Server Error. `, 
                details: error});
            return;
        }
    }

    async getReportById(req: Request, res: Response) {
        const { reportId } = req.body

        if (isNaN(reportId)) {
            res.status(400).json({ error: "reportId must be a valid number." });
            return;
        }

        try{
            const report = await this.reportService.getReportById(reportId);
            
            res.status(200).json({ 
                message: `Informations for Report {${reportId}}`,
                reportInf: report });
            return;
        } catch(error){
            res.status(500).json({ 
                message: `Error Internal Server.`,
                details: error });
            return;
        }
    }

    async deleteReport(req: Request, res: Response) {
        try{
            const { reportId } = req.body

            if (isNaN(reportId)) {
                res.status(400).json({ error: "reportId must be a valid number." });
                return;
            }
            const report = await this.reportService.getReportById(reportId);
            
            if(!report){
                res.status(404).json({ error: `Report not found.`});
                return;
            }

            await this.reportService.deleteReport(reportId);

            res.status(200).json({ 
                message: `${report.reportTitle} was deleted successfully!`,
                deletedReport: report });
            
            return;

        } catch(error){
            res.status(500).json({ 
                message: `Error Internal Server.`, 
                details: error });
            return;
        }
    }
}