import { Customer } from './customer';
import { Address } from './address';
import { OrderItem } from './order-item';
import { Order } from './order';
export class Purchase {
    customer: Customer;
    order: Order;
    shippingAddress: Address;
    billingAddress: Address;
    orderItems: OrderItem[];

}

