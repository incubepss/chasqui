import gql from 'graphql-tag';

export const GET_ORDER_STATS = gql`
  query GetOrderStats($start: DateTime!, $end: DateTime!) {
    ordersSold(options: { filter: { orderPlacedAt: { between: { start: $start, end: $end } } } }) {
      quantity
      totalWithTax
    }
  }
`;
