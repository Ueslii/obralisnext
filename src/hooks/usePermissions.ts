import { useState, useEffect } from 'react';

export type UserRole = 'admin' | 'engenheiro' | 'gestor' | 'usuario';

export interface Permission {
  obras: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    viewDetails: boolean;
  };
  financeiro: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  equipes: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  fornecedores: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  orcamentos: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  relatorios: {
    view: boolean;
    export: boolean;
  };
  configuracoes: {
    view: boolean;
    edit: boolean;
  };
}

const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    obras: { view: true, create: true, edit: true, delete: true, viewDetails: true },
    financeiro: { view: true, create: true, edit: true, delete: true },
    equipes: { view: true, create: true, edit: true, delete: true },
    fornecedores: { view: true, create: true, edit: true, delete: true },
    orcamentos: { view: true, create: true, edit: true, delete: true },
    relatorios: { view: true, export: true },
    configuracoes: { view: true, edit: true },
  },
  engenheiro: {
    obras: { view: true, create: true, edit: true, delete: false, viewDetails: true },
    financeiro: { view: true, create: true, edit: true, delete: false },
    equipes: { view: true, create: false, edit: false, delete: false },
    fornecedores: { view: true, create: true, edit: true, delete: false },
    orcamentos: { view: true, create: true, edit: true, delete: false },
    relatorios: { view: true, export: true },
    configuracoes: { view: true, edit: false },
  },
  gestor: {
    obras: { view: true, create: true, edit: true, delete: false, viewDetails: true },
    financeiro: { view: true, create: true, edit: true, delete: false },
    equipes: { view: true, create: true, edit: true, delete: false },
    fornecedores: { view: true, create: false, edit: false, delete: false },
    orcamentos: { view: true, create: true, edit: true, delete: false },
    relatorios: { view: true, export: false },
    configuracoes: { view: true, edit: false },
  },
  usuario: {
    obras: { view: true, create: false, edit: false, delete: false, viewDetails: false },
    financeiro: { view: false, create: false, edit: false, delete: false },
    equipes: { view: true, create: false, edit: false, delete: false },
    fornecedores: { view: false, create: false, edit: false, delete: false },
    orcamentos: { view: false, create: false, edit: false, delete: false },
    relatorios: { view: false, export: false },
    configuracoes: { view: true, edit: false },
  },
};

export const usePermissions = () => {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [permissions, setPermissions] = useState<Permission>(rolePermissions.admin);

  useEffect(() => {
    const savedRole = localStorage.getItem('buildwise_user_role') as UserRole;
    if (savedRole && rolePermissions[savedRole]) {
      setUserRole(savedRole);
      setPermissions(rolePermissions[savedRole]);
    }
  }, []);

  const changeRole = (role: UserRole) => {
    setUserRole(role);
    setPermissions(rolePermissions[role]);
    localStorage.setItem('buildwise_user_role', role);
  };

  const hasPermission = (module: keyof Permission, action: string): boolean => {
    return permissions[module]?.[action as keyof typeof permissions[typeof module]] || false;
  };

  return { userRole, permissions, changeRole, hasPermission };
};
