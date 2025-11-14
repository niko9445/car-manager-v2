import { MaintenanceCategory } from '../types';

export const MAINTENANCE_CATEGORIES: MaintenanceCategory[] = [
  {
    id: 'brakes',
    name: 'Тормозная система',
    icon: '',
    subcategories: [
      {
        id: 'brake_discs',
        name: 'Замена тормозных дисков',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд дисков', placeholder: 'Brembo' },
          { type: 'text', name: 'axle', label: 'Ось', placeholder: 'Передняя/Задняя' }
        ]
      },
      {
        id: 'brake_drums',
        name: 'Замена тормозных барабанов',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд барабанов', placeholder: 'Bosch' }
        ]
      },
      {
        id: 'brake_fluid',
        name: 'Замена тормозной жидкости',
        fields: [
          { type: 'text', name: 'type', label: 'Тип жидкости', placeholder: 'DOT 4' },
          { type: 'number', name: 'volume', label: 'Объем (л)', placeholder: '1', min: 0.1, step: 0.1 }
        ]
      },
      {
        id: 'brake_hoses',
        name: 'Замена тормозных шлангов',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд шлангов', placeholder: 'ATE' }
        ]
      },
      {
        id: 'brake_pads',
        name: 'Замена тормозных колодок',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд колодок', placeholder: 'Textar' },
          { type: 'text', name: 'axle', label: 'Ось', placeholder: 'Передняя/Задняя' }
        ]
      },
      {
        id: 'brake_bleeding',
        name: 'Прокачка тормозной системы',
        fields: []
      }
    ]
  },
  {
    id: 'electrical',
    name: 'Электрика',
    icon: '',
    subcategories: [
      {
        id: 'battery',
        name: 'Замена аккумулятора',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд АКБ', placeholder: 'Varta' },
          { type: 'text', name: 'capacity', label: 'Емкость', placeholder: '60 Ач' }
        ]
      },
      {
        id: 'fuses',
        name: 'Замена предохранителей',
        fields: [
          { type: 'text', name: 'amperage', label: 'Сила тока', placeholder: '10A' }
        ]
      },
      {
        id: 'generator',
        name: 'Замена генератора',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд генератора', placeholder: 'Bosch' }
        ]
      },
      {
        id: 'lamps',
        name: 'Замена ламп освещения',
        fields: [
          { type: 'text', name: 'type', label: 'Тип лампы', placeholder: 'H7' },
          { type: 'text', name: 'location', label: 'Расположение', placeholder: 'Фара ближнего света' }
        ]
      },
      {
        id: 'starter',
        name: 'Замена стартера',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд стартера', placeholder: 'Denso' }
        ]
      }
    ]
  },
  {
    id: 'engine',
    name: 'Двигатель',
    icon: '',
    subcategories: [
      {
        id: 'drive_belts',
        name: 'Замена приводных ремней',
        fields: [
          { type: 'text', name: 'belt_type', label: 'Тип ремня', placeholder: 'Ремень ГУР' }
        ]
      },
      {
        id: 'ignition_coils',
        name: 'Замена катушек зажигания',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд катушек', placeholder: 'Bosch' }
        ]
      },
      {
        id: 'spark_plugs',
        name: 'Замена свечей зажигания',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд свечей', placeholder: 'NGK' },
          { type: 'text', name: 'type', label: 'Тип свечей', placeholder: 'Иридиевые' }
        ]
      },
      {
        id: 'timing_belt',
        name: 'Замена ремня ГРМ',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд ремня', placeholder: 'Gates' }
        ]
      },
      {
        id: 'timing_chain',
        name: 'Замена цепи ГРМ',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд цепи', placeholder: 'INA' }
        ]
      },
      {
        id: 'timing_rollers',
        name: 'Замена роликов ГРМ',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд роликов', placeholder: 'SKF' }
        ]
      },
      {
        id: 'valve_adjustment',
        name: 'Регулировка клапанов',
        fields: []
      }
    ]
  },
  {
    id: 'filters',
    name: 'Фильтры',
    icon: '',
    subcategories: [
      {
        id: 'air_filter',
        name: 'Замена воздушного фильтра',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд фильтра', placeholder: 'Bosch' },
          { type: 'text', name: 'article', label: 'Артикул', placeholder: 'F 026 400 042' }
        ]
      },
      {
        id: 'cabin_filter',
        name: 'Замена салонного фильтра',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд фильтра', placeholder: 'Mann Filter' },
          { type: 'text', name: 'article', label: 'Артикул', placeholder: 'CUK 2939' }
        ]
      },
      {
        id: 'fuel_filter',
        name: 'Замена топливного фильтра',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд фильтра', placeholder: 'Knecht' }
        ]
      },
      {
        id: 'oil_filter',
        name: 'Замена масляного фильтра',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд фильтра', placeholder: 'Mann Filter' },
          { type: 'text', name: 'article', label: 'Артикул', placeholder: 'W 711/80' }
        ]
      }
    ]
  },
  {
    id: 'fluids',
    name: 'Жидкости',
    icon: '',
    subcategories: [
      {
        id: 'coolant',
        name: 'Замена охлаждающей жидкости',
        fields: [
          { type: 'number', name: 'volume', label: 'Объем (л)', required: true, placeholder: '6', min: 1 },
          { type: 'text', name: 'type', label: 'Тип жидкости', placeholder: 'G12' }
        ]
      },
      {
        id: 'engine_oil',
        name: 'Замена моторного масла',
        fields: [
          { type: 'number', name: 'volume', label: 'Объем масла (л)', required: true, placeholder: '4.5', min: 0.1, step: 0.1 },
          { type: 'text', name: 'oilType', label: 'Тип масла', required: true, placeholder: '5W-30' },
          { type: 'text', name: 'brand', label: 'Бренд', placeholder: 'Shell Helix' }
        ],
        defaultValues: { volume: 4.5 }
      },
      {
        id: 'power_steering_fluid',
        name: 'Замена жидкости ГУР',
        fields: [
          { type: 'number', name: 'volume', label: 'Объем (л)', placeholder: '1', min: 0.1, step: 0.1 },
          { type: 'text', name: 'type', label: 'Тип жидкости', placeholder: 'ATF' }
        ]
      },
      {
        id: 'transmission_oil_at',
        name: 'Замена масла в АКПП',
        fields: [
          { type: 'number', name: 'volume', label: 'Объем масла (л)', required: true, placeholder: '4', min: 1 },
          { type: 'text', name: 'oilType', label: 'Тип масла ATF', placeholder: 'ATF WS' }
        ]
      },
      {
        id: 'transmission_oil_mt',
        name: 'Замена масла в МКПП',
        fields: [
          { type: 'number', name: 'volume', label: 'Объем масла (л)', required: true, placeholder: '2', min: 1 },
          { type: 'text', name: 'oilType', label: 'Тип масла', placeholder: '75W-90' }
        ]
      },
      {
        id: 'washer_fluid',
        name: 'Замена омывающей жидкости',
        fields: [
          { type: 'number', name: 'volume', label: 'Объем (л)', placeholder: '3', min: 1 }
        ]
      }
    ]
  },
  {
    id: 'suspension',
    name: 'Подвеска и рулевое',
    icon: '',
    subcategories: [
      {
        id: 'alignment',
        name: 'Регулировка развала-схождения',
        fields: []
      },
      {
        id: 'ball_joints',
        name: 'Замена шаровых опор',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд опор', placeholder: 'Lemforder' }
        ]
      },
      {
        id: 'bushings',
        name: 'Замена сайлентблоков',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд сайлентблоков', placeholder: 'Corteco' }
        ]
      },
      {
        id: 'rack',
        name: 'Замена рулевой рейки',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд рейки', placeholder: 'TRW' }
        ]
      },
      {
        id: 'shock_absorbers',
        name: 'Замена амортизаторов',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд амортизаторов', placeholder: 'Bilstein' },
          { type: 'text', name: 'axle', label: 'Ось', placeholder: 'Передняя/Задняя' }
        ]
      },
      {
        id: 'stabilizer_links',
        name: 'Замена стоек стабилизатора',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд стоек', placeholder: 'Meyle' }
        ]
      },
      {
        id: 'tie_rods',
        name: 'Замена рулевых наконечников',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд наконечников', placeholder: 'Lemforder' }
        ]
      }
    ]
  },
  {
    id: 'transmission',
    name: 'Трансмиссия',
    icon: '',
    subcategories: [
      {
        id: 'clutch',
        name: 'Замена сцепления',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд сцепления', placeholder: 'Luk' }
        ]
      },
      {
        id: 'cv_joints',
        name: 'Замена ШРУСов',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд ШРУСов', placeholder: 'GKN' },
          { type: 'text', name: 'side', label: 'Сторона', placeholder: 'Левый/Правый' }
        ]
      },
      {
        id: 'cv_boots',
        name: 'Замена пыльников ШРУСов',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд пыльников', placeholder: 'Corteco' }
        ]
      },
      {
        id: 'hub_bearings',
        name: 'Замена подшипников ступиц',
        fields: [
          { type: 'text', name: 'brand', label: 'Бренд подшипников', placeholder: 'SKF' }
        ]
      },
      {
        id: 'rear_diff_fluid',
        name: 'Замена жидкости в редукторе',
        fields: [
          { type: 'number', name: 'volume', label: 'Объем (л)', placeholder: '1.5', min: 0.5, step: 0.1 },
          { type: 'text', name: 'oilType', label: 'Тип масла', placeholder: '75W-140' }
        ]
      }
    ]
  }
];