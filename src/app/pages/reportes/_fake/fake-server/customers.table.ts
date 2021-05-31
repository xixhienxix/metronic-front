export class HuespedTable {
  public static huespedes: any = [
    {
      id: 1,
      nombre: 'Frank Martinez Flores',
      estatus: 1,
      llegada: '10/03/2021',
      salida: '16/03/2021',
      noches: 6,
      porPagar: 2400,
      pendiente: -2400,
      origen: "Recepcion",
      habitacion: 1,
      _userId: 1,
      _createdDate: '09/07/2016',
      _updatedDate: '05/31/2013'
    },
    {
      id: 2,
      nombre: 'Lucero Carranza Ayala',
      estatus: 2,
      llegada: '11/03/2021',
      salida: '19/03/2021',
      noches: 6,
      porPagar: 455,
      pendiente: -2200,
      origen: "Recepcion",
      habitacion: 2,
      _userId: 2,
      _createdDate: '09/07/2016',
      _updatedDate: '05/31/2013'
    },
    {
      id: 3,
      nombre: 'Arturo Martinez Farias',
      estatus: 3,
      llegada: '12/03/2021',
      salida: '17/03/2021',
      noches: 6,
      porPagar: 240,
      pendiente: -5400,
      origen: "Recepcion",
      habitacion: 3,
      _userId: 3,
      _createdDate: '09/07/2016',
      _updatedDate: '05/31/2013'
    }

  ];
}
export class EstatusTable {
  public static estatus: any = [
    {
      id: 1,
      nombre: 'Húesped en Casa'
    },
    {
      id: 2,
      nombre: 'Reserva sin Pago'
    },
    {
      id: 3,
      nombre: 'Reserva Confirmada'
    },
    {
      id: 4,
      nombre: 'Hizó Check-out'
    },
    {
      id: 5,
      nombre: 'Uso interno'
    },
    {
      id: 6,
      nombre: 'Bloqueo Sin LLegada'
    },
    {
      id: 7,
      nombre: 'Reserva Temporal'
    }
  ];
}

