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
    Tarifa1Persona:number;
    Tarifa2Persona:number;
    Tarifa3Persona:number;
    Tarifa4Persona:number;
    Estado:boolean
    Dias:{
        name: string;
        value: string;
        checked: boolean;
    }[]
}
