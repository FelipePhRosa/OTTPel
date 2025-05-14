import connection from "../connection"

interface ReportData{
    reportTitle: string,
    user_id: number,
    categories_id: number,
    description: string,
    latitude: number,
    longitude: number,
    image?: string
}

export default class ReportService {
    async createReport(reportData: ReportData) {
        return await connection('reports').insert(reportData);
    }

    async getAllReports(){
        return await connection('reports').where({ status: 'aprovado'}).select('*');
    }

    async getAllReportsPending(){
        return await connection('reports').where({ status: 'pendente' }).select('*');
    }

    async getAllReportsRejected(){
        return await connection('reports').where({ status: 'rejeitado' }).select('*')
    }

    async getReportById(reportId: number){
        return await connection('reports').where({ id: reportId }).select('*').first();
    }

    async deleteReport(reportId: number){
        return await connection('reports').where({ id: reportId }).delete();
    }
}