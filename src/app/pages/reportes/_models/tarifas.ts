import { BaseModel } from "src/app/_metronic/shared/crud-table";

export interface Tarifas extends BaseModel {

    Tarifa:string;
    Habitacion:string[];
    Llegada:string;
    Salida:string;
    Plan:string;
    Politicas:string;
    EstanciaMinima:number;
    EstanciaMaxima:number;
    TarifaRack:number;
    TarifaXAdulto:number[]
    TarifaXNino:number[]
    Estado:boolean,
    Adultos:number,
    Ninos:number,
    Dias:{
        name: string;
        value: number;
        checked: boolean;
    }[],
    hotel?:string;

}
