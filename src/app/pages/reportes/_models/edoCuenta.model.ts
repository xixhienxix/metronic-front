export interface edoCuenta {
    _id?:string,
    Folio:number,
    Referencia:string,
    Forma_de_Pago:string,
    Fecha:Date,
    Descripcion:string,
    Cantidad:number,
    Cargo?:number,
    Abono?:number,
    Total?:number
}