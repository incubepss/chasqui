type SelloDescription = {
  name: string;
  code: string;
  description: string;
};

export const hardcodedDescriptions: SelloDescription[] = [
  {
    name: 'Agroecológico',
    code: 'agroecologico',
    description:
      'Producto agroecológico. Se trata de productos que son resultado de una forma de trabajar la tierra sin el uso de productos químicos, promoviendo la salud del ecosistema y de los consumidores y el desarrollo local y sostenible. Además de ser productos sanos, sin tóxicos y sin sustancias dañinas, estos productos son eminentemente locales e incorporan, junto al aspecto técnico de la producción, una valoración positiva por las formas asociativas, cooperativas y de desarrollo sostenible.',
  },
  {
    name: 'Orgánico',
    code: 'organico',
    description:
      'Producto orgánico. Se denomina así al producto agrícola o agroindustrial certificado que se produce bajo un conjunto de procedimientos establecidos por leyes y parámetros internacionales. En general, los métodos ecológicos que los caracterizan evitan el uso de productos sintéticos, como pesticidas, herbicidas y fertilizantes artificiales.',
  },
  {
    name: 'Reciclado',
    code: 'reciclado',
    description:
      'Productos reciclables y/o hechos en base a productos reciclados. En el caso de frascos o botellas en la descripción del producto podrás informarte sobre cómo poder re integrarlas al productor para su re utilización.',
  },
  {
    name: 'Artesanal',
    code: 'artesanal',
    description:
      'Producto artesanal. Se trata de productos elaborados fundamentalmente de forma manual. Son productos únicos fruto del proceso creativo de él o la artesana. Incluye productos de: alfarería, carpintería, gastronomía, herrería, bordado, cerámica, entre muchos otros.',
  },
  {
    name: 'En red',
    code: 'en_red',
    description:
      'Producto que incorpora producción en red. Son productos elaborados con materias primas provenientes de otras organizaciones de la economía social y solidaria. Estas prácticas desarrollan procesos de intercooperación que generan lazos solidarios y fortalecen el sector de la ESS.',
  },
  {
    name: 'Kilometro cero',
    code: 'kilometro_cero',
    description: `Producto kilómetro cero. Son productos locales o regionales que no han viajado cientos o miles de kilómetros hasta llegar a manos de los/as consumidores/as.Las ventajas de consumir productos de Km 0 son varias, entre las principales:

    1.- Al haber menos intermediarios el reparto de los ingresos es más justo.

    2.- Se reduce las emisiones de CO2 producidas en el transporte de mercancías.

    3.- Al elegir estos productos ayudás a la economía local.`,
  },
  {
    name: 'Cooperativas',
    code: 'cooperativas',
    description:
      'Una cooperativa es una asociación autónoma de personas que se unen voluntariamente para satisfacer sus necesidades comunes y aspiraciones económicas, sociales y culturales por medio de una empresa de propiedad colectiva, democráticamente gobernada.',
  },
  {
    name: 'Agricultura familiar',
    code: 'agricultura_familiar',
    description: `Este es un tipo de producción en el que la unidad doméstica y la unidad productiva están integradas. Las familias aportan la principal fuerza de trabajo utilizada y la producción se destina tanto al autoconsumo como al mercado.

                  Habitualmente desarrollan actividades agrícolas diversificadas, que les otorgan un papel fundamental a la hora de garantizar la sostenibilidad del medio ambiente y la conservación de la biodiversidad.

                  La agricultura familiar ofrece a nivel mundial alimentos sanos, seguros y soberanos. El 30% de las tierras en el mundo están ocupadas por campesinos y pequeños productores. En ese reducido porcentaje de tierras se producen el 70% de los alimentos del mundo.`,
  },
  {
    name: 'Empresa social',
    code: 'empresa_social',
    description:
      'Las empresas sociales son organizaciones asociativas que realizan una actividad económica regular de producción de bienes o prestación de servicios con una definida finalidad social para la comunidad y la integración social de las personas, particularmente de los grupos socialmente vulnerables y vulnerados.',
  },
  {
    name: 'Recuperadas',
    code: 'recuperadas',
    description:
      'Esta es una organización autogestionaria, muchas veces conformada como cooperativa, integrada por los/as ex empleados/as de una empresa de lucro que cerró o fue abandonada por sus dueños, generalmente por maniobras de vaciamiento o quiebra fraudulenta. Son empresas en manos de los/as trabajadores que ponen de relieve que el derecho al trabajo es más importante que el lucro.',
  },
];
