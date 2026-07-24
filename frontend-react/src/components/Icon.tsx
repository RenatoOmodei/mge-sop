export type IconName =
  | 'plus'
  | 'edit'
  | 'status'
  | 'save'
  | 'trash'
  | 'close'
  | 'refresh'
  | 'download'
  | 'file'
  | 'box'
  | 'check'
  | 'eye'
  | 'ruler'
  | 'filter'
  | 'truck'
  | 'printer'
  | 'upload'
  | 'history';

const iconPaths: Record<IconName, string> = {
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z',
  edit: 'M5 16.6 15.9 5.7l2.4 2.4L7.4 19H5v-2.4ZM17.1 4.5l2.4 2.4-1 1-2.4-2.4 1-1Z',
  status: 'M4 6h10v2H4V6Zm0 5h16v2H4v-2Zm0 5h12v2H4v-2Zm13.6-9.2 1.4 1.4-3.7 3.7-2.1-2.1 1.4-1.4.7.7 2.3-2.3Z',
  save: 'M5 4h11.2L19 6.8V20H5V4Zm2 2v12h10V7.6L15.4 6H15v5H8V6H7Zm3 0v3h3V6h-3Zm0 9h4v2h-4v-2Z',
  trash: 'M8 5V3h8v2h4v2H4V5h4Zm-1 4h2v9h2V9h2v9h2V9h2v11H7V9Z',
  close: 'm6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z',
  refresh: 'M17.7 6.3A8 8 0 0 0 4.1 10h2.1a6 6 0 0 1 10.1-2.3L14 10h6V4l-2.3 2.3ZM6.3 17.7A8 8 0 0 0 19.9 14h-2.1a6 6 0 0 1-10.1 2.3L10 14H4v6l2.3-2.3Z',
  download: 'M11 4h2v8l3-3 1.4 1.4L12 15.8l-5.4-5.4L8 9l3 3V4ZM5 18h14v2H5v-2Z',
  file: 'M6 3h8l4 4v14H6V3Zm2 2v14h8V8h-3V5H8Zm2 7h4v2h-4v-2Zm0 4h4v2h-4v-2Z',
  box: 'M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 2.2L16.8 7 12 9.4 7.2 7 12 5.2ZM6 8.6l5 2.5v7.2l-5-2.5V8.6Zm12 0v7.2l-5 2.5v-7.2l5-2.5Z',
  check: 'm9.2 16.2-4-4 1.4-1.4 2.6 2.6 8.2-8.2 1.4 1.4-9.6 9.6Z',
  eye: 'M12 5c5 0 8 4.5 8 7s-3 7-8 7-8-4.5-8-7 3-7 8-7Zm0 2c-3.7 0-6 3.5-6 5s2.3 5 6 5 6-3.5 6-5-2.3-5-6-5Zm0 2.2A2.8 2.8 0 1 1 12 14.8 2.8 2.8 0 0 1 12 9.2Z',
  ruler: 'M5 17.6 17.6 5 19 6.4 6.4 19H5v-1.4Zm9.6-10 1.8 1.8L15 10.8 13.2 9l1.4-1.4Zm-3 3 1.8 1.8L12 13.8 10.2 12l1.4-1.4Zm-3 3 1.8 1.8L9 16.8 7.2 15l1.4-1.4Z',
  filter: 'M4 5h16l-6 7v6l-4 2v-8L4 5Z',
  truck: 'M3 6h11v8h2.2L18 10h3v7h-2a2.5 2.5 0 0 1-5 0H9a2.5 2.5 0 0 1-5 0H3V6Zm2 2v7.2A2.5 2.5 0 0 1 8.8 16H14V8H5Zm11 4v4h.2a2.5 2.5 0 0 1 1.6-.8H19v-3.2h-1.7L16 12Z',
  printer: 'M7 4h10v5H7V4Zm-2 7h14a2 2 0 0 1 2 2v5h-4v3H7v-3H3v-5a2 2 0 0 1 2-2Zm4 5v3h6v-3H9Zm8-2h2v-1h-2v1Z',
  upload: 'M11 20v-8L8 15l-1.4-1.4L12 8.2l5.4 5.4L16 15l-3-3v8h-2ZM5 4h14v2H5V4Z',
  history: 'M12 5a7 7 0 1 1-6.3 4H3l3-3 3 3H7.9A5 5 0 1 0 12 7v4l3 2-1 1.7-4-2.7V5h2Z'
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="ui-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function IconText({ name, children }: { name: IconName; children: string }) {
  return (
    <>
      <Icon name={name} />
      <span>{children}</span>
    </>
  );
}
