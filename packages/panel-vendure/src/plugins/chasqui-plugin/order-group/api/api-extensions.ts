import gql from 'graphql-tag';

export const commonApiExtensions = gql`
  # // TODO  @debt: ver como usar OrderItemGroup del plugin orders-by-product
  type OrderItemGrouped2 {
    productorId: String
    productorNombre: String
    productoNombre: String!
    productoSku: String!
    shippingMethodCode: String
    cantidad: Int
    stockOnHand: Int
    stockAllocated: Int
    listPrice: Float
    subTotallistPrice: Float
  }

  type OrderGroup implements Node {
    createdAt: DateTime
    updatedAt: DateTime
    orderPlacedAt: DateTime
    id: ID!
    code: String
    alias: String
    state: String
    active: Boolean
    channel: Channel
    customer: Customer
    totalQuantity: Int
    shipping: Int
    shippingWithTax: Int
    subTotal: Int
    subTotalWithTax: Int
    total: Int
    totalWithTax: Int
    ordersQuantity: Int
    currencyCode: String
    shippingLine: ShippingLine
    shippingLines: [ShippingLine]
    shippingAddress: OrderAddress
    shippingMethod: ShippingMethod

    lines: [OrderLine]
    linesGrouped: [OrderItemGrouped2]
    ordersConfirmed(options: OrderListOptions): OrderList
    orders(options: OrderListOptions): OrderList
    fulfillments: [Fulfillment!]
  }

  type CancelOrderGroupsError implements ErrorResult {
    errorCode: ErrorCode!
    message: String!
  }

  union CancelOrderGroupResult = OrderGroup | CancelOrderGroupsError

  input OrderGroupListOptions

  extend input OrderGroupFilterParameter {
    shippingMethodId: ID
    key: String
  }

  type OrderGroupList implements PaginatedList {
    items: [OrderGroup!]!
    totalItems: Int!
  }

  extend type Query {
    orderGroupByCode(code: String!): OrderGroup
  }

  extend type Mutation {
    cancelOrderGroup(orderGroupId: ID): CancelOrderGroupResult
  }

  input OrderGroupCreateInput {
    code: String
  }

  input OrderGroupFilterParameter {
    customerId: ID
  }
`;

export const adminApiExtensions = gql`
  ${commonApiExtensions}

  type StatOrdersGroupByState {
    state: String
    count: Int
    subTotalWithTax: Float
    subTotalshippingWithTax: Float
  }

  input InputCountOrdersGroupByState {
    shippingMethodId: ID
    key: String
    orderPlacedAt: DateOperators
  }

  extend type Query {
    ordersGroup(options: OrderGroupListOptions): OrderGroupList!
    countOrdersGroupByState(options: InputCountOrdersGroupByState): [StatOrdersGroupByState]
  }

  extend type Mutation {
    addFulfillmentToOrderGroup(orderGroupId: ID!, input: FulfillOrderInput!): AddFulfillmentToOrderResult!
    transitionToShipped(orderGroupId: ID!): OrderGroup
    transitionToDelivered(orderGroupId: ID!): OrderGroup
    transitionOrderGroup(orderGroupId: ID!, state: String!): OrderGroup
  }
`;

export const shopApiExtensions = gql`
  ${commonApiExtensions}

  extend enum ErrorCode {
    DISABLED_ORDERGROUPS_ERROR
    CANCEL_ORDER_OF_ORDERGROUPS_ERROR
  }

  type DisabledOrderGroupsError implements ErrorResult {
    errorCode: ErrorCode!
    message: String!
  }

  input CancelOrderOfGroupInput {
    orderGroupId: ID
    orderId: ID
  }

  type CancelOrderOfGroupError implements ErrorResult {
    errorCode: ErrorCode!
    message: String!
    parentErrorCode: String
  }

  union CancelOrderOfGroupResult = Order | CancelOrderOfGroupError

  union CreateOrderGroupResult = OrderGroup | DisabledOrderGroupsError
  union AssignOrderOnGroupResult = Order | DisabledOrderGroupsError

  extend type Customer {
    ordersGroup(options: OrderGroupListOptions): OrderGroupList
  }

  extend type Mutation {
    createOrderGroup(shippingMethodId: ID, address: CreateAddressInput): CreateOrderGroupResult
    createOrderGroupActiveOrder(input: OrderGroupCreateInput): CreateOrderGroupResult
    deactivateOrderGroupActiveOrder: Order
    assignActiveOrderToGroup(orderGroupCode: String, alias: String): AssignOrderOnGroupResult
    confirmOrderGroup(code: String): OrderGroup
    cancelOrderOfGroup(input: CancelOrderOfGroupInput!): CancelOrderOfGroupResult
  }
`;
