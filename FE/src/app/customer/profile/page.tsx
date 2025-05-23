"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";
import axios from "axios";

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
}

interface UserAccount {
  username: string;
}

export default function CustomerProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    gender: "",
    age: 0
  });
  
  const [account, setAccount] = useState<UserAccount>({
    username: ""
  });

  const [newPassword, setNewPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth='));

    if (authCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
        console.log("User from cookie:", user);
        
        if (user.id) {
          setCustomerId(user.id);
          setToken(user.token || "");
          setAccount(prev => ({ ...prev, username: user.username || "" }));
          
          console.log("Chuẩn bị gọi fetchUserProfile với customerId:", user.id);
          fetchUserProfile(user.id);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    } else {
      console.log("Không tìm thấy cookie auth");
    }
  }, []);

  const fetchUserProfile = async (customerId: number) => {
    setIsLoading(true);
    console.log("customerId:", customerId);
    try {
      console.log("Đang gửi request tới API lấy thông tin người dùng...");
      const response = await axios.post("http://localhost:3001/customer/getCustomerInfo", 
        { "userId": customerId },
        { 
          headers: { "Content-Type": "application/json" }
        }
      );

      console.log("Dữ liệu nhận được từ API:", response.data);
      
      if (response.status === 200 && response.data.status === "Lấy thông tin khách hàng thành công") {
        const data = response.data;
        const names = data.customerName ? data.customerName.split(" ") : ["", ""];
        const firstname = names.slice(0, names.length - 1).join(" ");
        const lastname = names[names.length - 1];

        setProfile({
          id: data.customerId,
          firstname: firstname,
          lastname: lastname,
          email: data.customerEmail || "",
          phone: data.customerPhone || "",
          gender: data.customerGender || "",
          age: data.customerAge || 0
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể lấy thông tin khách hàng: " + (response.data.status || "Lỗi không xác định"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin cá nhân:', error);
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const changePassword = async () => {
    if (newPassword.new !== newPassword.confirm) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword.current || !newPassword.new) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin mật khẩu",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Đang gửi request cập nhật mật khẩu...");
      const response = await axios.post("http://localhost:3001/updateAccount", 
        {
          username: account.username,
          password: newPassword.new
        },
        {
          headers: {
            "Content-Type": "application/json",
            "token": token || ""
          }
        }
      );
      
      console.log("Kết quả cập nhật mật khẩu:", response.data);
      
      if (response.status === 200 && response.data.status === "Cập nhật tài khoản thành công") {
        toast({
          title: "Thành công!",
          description: response.data.status,
          variant: "default",
        });
        setNewPassword({ current: "", new: "", confirm: "" });
      } else {
        toast({
          title: "Lỗi",
          description: response.data.status || "Không thể cập nhật mật khẩu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật mật khẩu:', error);
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
              <CardDescription>
                Xem thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Họ</Label>
                    <Input 
                      id="firstname" 
                      name="firstname" 
                      value={profile.firstname} 
                      disabled={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Tên</Label>
                    <Input 
                      id="lastname" 
                      name="lastname" 
                      value={profile.lastname} 
                      disabled={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={profile.email} 
                      disabled={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={profile.phone} 
                      disabled={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Input 
                      id="gender" 
                      name="gender" 
                      value={profile.gender} 
                      disabled={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Tuổi</Label>
                    <Input 
                      id="age" 
                      name="age" 
                      type="number" 
                      value={profile.age.toString()} 
                      disabled={true}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Để thay đổi thông tin cá nhân, vui lòng liên hệ với quản lý phòng tập.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thông tin tài khoản</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input 
                  id="username" 
                  value={account.username} 
                  disabled
                />
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium mb-4">Đổi mật khẩu</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input 
                      id="currentPassword" 
                      name="current"
                      type="password" 
                      value={newPassword.current}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input 
                      id="newPassword" 
                      name="new"
                      type="password" 
                      value={newPassword.new}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirm"
                      type="password" 
                      value={newPassword.confirm}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Cập nhật mật khẩu</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận thay đổi mật khẩu?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn thay đổi mật khẩu không? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                    <AlertDialogAction onClick={changePassword} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Xác nhận
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}