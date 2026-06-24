"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  AlertCircle,
  Plus,
  X,
  Edit2,
  UserX,
  UserCheck,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useModal } from "@/components/modal-provider";

// Import server actions untuk manajemen admin
import { createAdminAction } from "@/src/modules/admin-management/actions/create-admin.action";
import { updateAdminRoleAction } from "@/src/modules/admin-management/actions/update-admin-role.action";
import { deactivateAdminAction } from "@/src/modules/admin-management/actions/deactivate-admin.action";
import { deleteAdminAction } from "@/src/modules/admin-management/actions/delete-admin.action";

interface AdminManagerProps {
  admins?: any[];
  currentAdmin?: {
    id: string;
    supabaseId: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export function AdminManager({ admins = [], currentAdmin }: AdminManagerProps) {
  // Admin Management States
  const [adminList, setAdminList] = useState<any[]>(admins);
  const [adminForm, setAdminForm] = useState({
    id: "",
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN_PESANAN",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminPending, startAdminTransition] = useTransition();

  // State untuk konfirmasi hapus permanen admin
  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState<any | null>(null);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState<string>("");
  const [deleteConfirmError, setDeleteConfirmError] = useState<string | null>(null);

  const { alert, confirm } = useModal();

  // Handle Admin Form Change
  const handleAdminFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Create or Update Admin
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!isEditMode && adminForm.password !== adminForm.confirmPassword) {
      setAdminError("Konfirmasi password tidak cocok.");
      return;
    }

    startAdminTransition(async () => {
      if (isEditMode) {
        // Edit Role Mode
        const res = await updateAdminRoleAction(adminForm.id, adminForm.role as any);
        if (res.success && res.data) {
          setAdminList((prev) =>
            prev.map((a) => (a.id === adminForm.id ? { ...a, role: res.data.role } : a))
          );
          toast.success("Peran admin berhasil diperbarui!");
          resetAdminForm();
        } else {
          setAdminError(res.error || "Gagal memperbarui peran admin.");
        }
      } else {
        // Create Mode
        const res = await createAdminAction({
          name: adminForm.name,
          email: adminForm.email,
          username: adminForm.username,
          password: adminForm.password,
          role: adminForm.role as any,
        });

        if (res.success && res.data) {
          setAdminList((prev) => [res.data, ...prev]);
          toast.success("Admin baru berhasil ditambahkan!");
          resetAdminForm();
        } else {
          setAdminError(res.error || "Gagal menambahkan admin baru.");
        }
      }
    });
  };

  const resetAdminForm = () => {
    setAdminForm({
      id: "",
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "ADMIN_PESANAN",
    });
    setIsEditMode(false);
    setShowPassword(false);
    setAdminError(null);
  };

  const handleEditAdminClick = (admin: any) => {
    setAdminForm({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      username: admin.username,
      password: "", // password kosong di mode edit
      confirmPassword: "",
      role: admin.role,
    });
    setIsEditMode(true);
    setAdminError(null);
  };

  const handleDeactivateAdmin = async (admin: any) => {
    const isConfirmed = await confirm(
      `Apakah Anda yakin ingin menonaktifkan admin ${admin.name}? Akun ini tidak akan bisa diaktifkan kembali kecuali Anda menghapusnya secara permanen dan membuat akun baru dengan kredensial yang sama.`
    );
    if (!isConfirmed) return;

    startAdminTransition(async () => {
      const res = await deactivateAdminAction(admin.id);
      if (res.success && res.data) {
        setAdminList((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, isActive: false } : a))
        );
        toast.success("Admin berhasil dinonaktifkan!");
      } else {
        await alert(res.error || "Gagal menonaktifkan admin.");
      }
    });
  };

  const handleDeleteAdminClick = (admin: any) => {
    setDeleteConfirmAdmin(admin);
    setDeleteConfirmUsername("");
    setDeleteConfirmError(null);
  };

  const confirmDeleteAdmin = async () => {
    if (!deleteConfirmAdmin) return;

    if (deleteConfirmUsername !== deleteConfirmAdmin.username) {
      setDeleteConfirmError("Username yang Anda masukkan tidak cocok.");
      return;
    }

    startAdminTransition(async () => {
      const res = await deleteAdminAction(deleteConfirmAdmin.id);
      if (res.success) {
        setAdminList((prev) => prev.filter((a) => a.id !== deleteConfirmAdmin.id));
        toast.success("Akun admin berhasil dihapus secara permanen!");
        setDeleteConfirmAdmin(null);
        setDeleteConfirmUsername("");
        setDeleteConfirmError(null);
      } else {
        setDeleteConfirmError(res.error || "Gagal menghapus admin.");
      }
    });
  };

  const filteredAdminList = adminList.filter((admin) => {
    if (roleFilter === "ALL") return true;
    return admin.role === roleFilter;
  });

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        <AdminHeader title="Manajemen Studio Seniman Kamera" />

        {/* Content Container */}
        <div className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full space-y-12">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/20 pb-6">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
                Manajemen Admin
              </h2>
              <p className="font-sans text-sm text-secondary font-light">
                Kelola akun pengguna admin, peran, dan hak akses mereka.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Side */}
            <form
              onSubmit={handleAdminSubmit}
              className="lg:col-span-4 border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs"
            >
              <h3 className="font-serif text-lg text-primary mb-4 font-semibold flex items-center justify-between pb-3 border-b border-border/20">
                <span className="flex items-center gap-2">
                  {isEditMode ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isEditMode ? "Ubah Peran Admin" : "Tambah Admin Baru"}
                </span>
                {isEditMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetAdminForm}
                    className="h-6 w-6 p-0 text-secondary hover:text-primary cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </h3>

              {adminError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 flex items-center gap-2 text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={adminForm.name}
                  onChange={handleAdminFormChange}
                  placeholder="Nama Lengkap Admin"
                  disabled={isEditMode}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary disabled:bg-muted/10 disabled:text-secondary"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={adminForm.email}
                  onChange={handleAdminFormChange}
                  placeholder="email@domain.com"
                  disabled={isEditMode}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary disabled:bg-muted/10 disabled:text-secondary"
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={adminForm.username}
                  onChange={handleAdminFormChange}
                  placeholder="username123"
                  disabled={isEditMode}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary disabled:bg-muted/10 disabled:text-secondary"
                  required
                />
              </div>

              {/* Password (Hanya di mode create) */}
              {!isEditMode && (
                <>
                  <div className="space-y-1.5">
                    <label className="uppercase tracking-wider text-secondary font-bold block">
                      Password (min 8 karakter)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={adminForm.password}
                        onChange={handleAdminFormChange}
                        placeholder="********"
                        className="w-full pl-3 pr-10 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary hover:text-primary cursor-pointer focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="uppercase tracking-wider text-secondary font-bold block">
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={adminForm.confirmPassword || ""}
                      onChange={handleAdminFormChange}
                      placeholder="********"
                      className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                      required
                    />
                  </div>
                </>
              )}

              {/* Peran / Role */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Peran (Role)
                </label>
                <select
                  name="role"
                  value={adminForm.role}
                  onChange={handleAdminFormChange}
                  className="w-full px-3 py-2 bg-background border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN_PESANAN">Admin Pesanan</option>
                  <option value="ADMIN_CMS">Admin CMS</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isAdminPending}
                  className="w-full uppercase tracking-widest py-5 rounded-none font-bold text-white cursor-pointer"
                >
                  {isAdminPending
                    ? "Memproses..."
                    : isEditMode
                    ? "Perbarui Peran"
                    : "Tambah Admin"}
                </Button>
              </div>
            </form>

            {/* Table Side */}
            <div className="lg:col-span-8 border border-border/40 bg-card p-6 space-y-4 rounded-none font-sans text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/20">
                <h3 className="font-serif text-lg text-primary uppercase tracking-wider text-xs">
                  Daftar Admin Terdaftar
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-secondary font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                    Filter Peran:
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-2 py-1 bg-background border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary text-[11px]"
                  >
                    <option value="ALL">Semua Peran</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN_PESANAN">Admin Pesanan</option>
                    <option value="ADMIN_CMS">Admin CMS</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-border/40 uppercase tracking-wider text-secondary font-bold">
                      <th className="py-3 px-2">Nama</th>
                      <th className="py-3 px-2">Username / Email</th>
                      <th className="py-3 px-2">Peran</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-primary">
                    {filteredAdminList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-secondary font-light">
                          Tidak ada admin terdaftar yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAdminList.map((admin) => (
                        <tr key={admin.id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-4 px-2 font-bold">{admin.name}</td>
                          <td className="py-4 px-2">
                            <div>@{admin.username}</div>
                            <div className="text-[10px] text-secondary">{admin.email}</div>
                          </td>
                          <td className="py-4 px-2">
                            <span
                              className={`px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest rounded-sm ${
                                admin.role === "SUPER_ADMIN"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : admin.role === "ADMIN_PESANAN"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {admin.role === "SUPER_ADMIN"
                                ? "Super"
                                : admin.role === "ADMIN_PESANAN"
                                ? "Pesanan"
                                : "CMS"}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest rounded-sm ${
                                admin.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {admin.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              {/* Edit Role Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Ubah Peran"
                                disabled={
                                  !admin.isActive ||
                                  admin.supabaseId === currentAdmin?.supabaseId
                                }
                                onClick={() => handleEditAdminClick(admin)}
                                className="h-8 w-8 text-secondary hover:text-primary cursor-pointer disabled:opacity-40"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>

                              {/* Deactivate Button */}
                              {admin.isActive ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Nonaktifkan Admin"
                                  disabled={
                                    admin.supabaseId === currentAdmin?.supabaseId
                                  }
                                  onClick={() => handleDeactivateAdmin(admin)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer disabled:opacity-40"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </Button>
                              ) : (
                                <div className="h-8 w-8 flex items-center justify-center text-secondary/40" title="Admin sudah dinonaktifkan">
                                  <UserCheck className="w-3.5 h-3.5 opacity-30" />
                                </div>
                              )}

                              {/* Delete Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={
                                  admin.isActive
                                    ? "Nonaktifkan admin terlebih dahulu untuk menghapus"
                                    : "Hapus Admin Permanen"
                                }
                                disabled={
                                  admin.isActive ||
                                  admin.supabaseId === currentAdmin?.supabaseId
                                }
                                onClick={() => handleDeleteAdminClick(admin)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer disabled:opacity-40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Super Admin Lockout Warning */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 text-amber-800 rounded-none flex gap-2.5 text-[10px] leading-relaxed">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Catatan Keamanan</span>
                  Akun dengan peran <b>Super Admin</b> tidak dapat dinonaktifkan. Anda tidak dapat mengubah peran atau menonaktifkan akun Anda sendiri yang sedang aktif untuk menghindari lockout.
                </div>
              </div>

              {/* Deskripsi Hak Akses Peran */}
              <div className="pt-5 border-t border-border/20 space-y-3">
                <h4 className="font-serif text-xs text-primary uppercase tracking-wider font-bold">
                  Matriks Hak Akses Peran (Role Permissions)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-center font-sans text-[10px] border border-border/20 border-collapse">
                    <thead>
                      <tr className="bg-muted/10 border-b border-border/20 uppercase tracking-wider text-secondary font-bold text-left">
                        <th className="py-2.5 px-3 border-r border-border/20 w-[130px]">Peran</th>
                        <th className="py-2.5 px-3 border-r border-border/20 text-center">Manajemen Admin</th>
                        <th className="py-2.5 px-3 border-r border-border/20 text-center">Jadwal & Pesanan</th>
                        <th className="py-2.5 px-3 border-r border-border/20 text-center">Manajemen Konten (CMS)</th>
                        <th className="py-2.5 px-3 text-center">Pengaturan Situs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-primary">
                      <tr className="hover:bg-muted/5 transition-colors">
                        <td className="py-3 px-2.5 font-bold border-r border-border/20 text-left">
                          <span className="text-purple-700 dark:text-purple-400 font-sans text-[9px] font-bold uppercase tracking-widest bg-purple-50 dark:bg-purple-950/20 px-1.5 py-0.5 border border-purple-200 dark:border-purple-800 rounded-sm">
                            Super Admin
                          </span>
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/5 transition-colors">
                        <td className="py-3 px-2.5 font-bold border-r border-border/20 text-left">
                          <span className="text-blue-700 dark:text-blue-400 font-sans text-[9px] font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 border border-blue-200 dark:border-blue-800 rounded-sm">
                            Admin Pesanan
                          </span>
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/5 transition-colors">
                        <td className="py-3 px-2.5 font-bold border-r border-border/20 text-left">
                          <span className="text-emerald-700 dark:text-emerald-400 font-sans text-[9px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 border border-emerald-200 dark:border-emerald-800 rounded-sm">
                            Admin CMS
                          </span>
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5 border-r border-border/20">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        </td>
                        <td className="py-3 px-2.5">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Modal Konfirmasi Hapus Permanen */}
      {deleteConfirmAdmin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]" 
            onClick={() => {
              setDeleteConfirmAdmin(null);
              setDeleteConfirmUsername("");
              setDeleteConfirmError(null);
            }}
          />
          
          {/* Modal Content */}
          <div className="bg-card border border-border/40 text-foreground max-w-sm w-full p-8 relative z-10 rounded-none shadow-2xl flex flex-col space-y-6 animate-[scaleIn_0.2s_ease-out] font-sans text-xs">
            <div className="space-y-2">
              <span className="font-sans text-[9px] uppercase tracking-widest text-red-600 font-bold block">
                Konfirmasi Penghapusan Permanen
              </span>
              <h3 className="font-serif text-lg font-medium text-primary leading-tight animate-[pulse_2s_infinite]">
                Hapus Akun @{deleteConfirmAdmin.username}?
              </h3>
              <p className="text-secondary font-light leading-relaxed">
                Tindakan ini akan menghapus akun admin <strong>{deleteConfirmAdmin.name}</strong> secara permanen dari database dan sistem login Supabase. Tindakan ini tidak dapat dibatalkan.
              </p>
              <p className="text-secondary font-light leading-relaxed">
                Untuk memverifikasi, silakan ketik username <strong>{deleteConfirmAdmin.username}</strong> di bawah ini:
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={deleteConfirmUsername}
                onChange={(e) => {
                  setDeleteConfirmUsername(e.target.value);
                  setDeleteConfirmError(null);
                }}
                placeholder="Ketik username untuk konfirmasi"
                className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-red-600 focus:outline-none rounded-none text-primary"
              />
              {deleteConfirmError && (
                <p className="text-red-600 text-[10px]">{deleteConfirmError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmAdmin(null);
                  setDeleteConfirmUsername("");
                  setDeleteConfirmError(null);
                }}
                className="px-4 py-2.5 bg-transparent border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 text-primary font-sans text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteAdmin}
                disabled={isAdminPending || deleteConfirmUsername !== deleteConfirmAdmin.username}
                className="px-5 py-2.5 bg-red-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
              >
                {isAdminPending ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
