import { HuespedTable } from './customers.table';
import { CarsTable } from './cars.table';
import { RemarksTable } from './remarks.table';
import { CarSpecificationsTable } from './car-specifications.table';
import { OrdersTable } from './orders.table';

// Wrapper class
export class ReportesDataContext {
  public static huespedes: any = HuespedTable.huespedes;

  public static cars: any = CarsTable.cars;

  // e-commerce car remarks
  // one => many relations
  public static remarks = RemarksTable.remarks;

  // e-commerce car specifications
  // one => many relations
  public static carSpecs = CarSpecificationsTable.carSpecifications;


  public static orders = OrdersTable.orders;
}
