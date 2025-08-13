export interface Response <T>{
    data: T,
    statusCode: number,
    message: string,
    registers_count: number,
    error:string
}