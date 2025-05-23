
export type User = {
    name: string;
    icon: React.ReactNode | null; 
  };
  
  export type HeaderProps = {
    user: User;
    pathName: string;
  };
  