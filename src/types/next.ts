export interface PageProps<T = {}> {
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
}

export interface LayoutProps<T = {}> {
  children: React.ReactNode;
  params: T;
}
