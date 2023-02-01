export default function (values: any) {
  return [
    {
      title: values['dashboard']['title'],
      link: '/pages/dashboard',
      menuIcon: 'icon icon-console',
    },
    {
      title: values['management']['title'],
      children: [
        { title: values['management']['product'], link: '/pages/management/product' },
        { title: values['management']['order'], link: '/pages/management/order' },
      ],
      link: '/pages/management',
      menuIcon: 'icon icon-table',
    },
  ];
}
