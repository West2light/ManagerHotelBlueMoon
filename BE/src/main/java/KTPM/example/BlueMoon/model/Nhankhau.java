package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "nhankhau")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Nhankhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int nhankhauid;
    private String hoten;
    private Date ngaysinh;
    private boolean gioitinh;
    private String dantoc;
    private String tongiao;
    private String cccd;
    private Date ngaycap;
    private String noicap;
    private String nghenghiep;
    private String ghichu;

    @ManyToOne
    @JoinColumn(name = "hokhauid")
    private Hokhau hokhau;

    @OneToMany(mappedBy = "nhankhau")
    private List<Tamtrutamvang> temporarilyAbsents;

    @OneToMany(mappedBy = "nhankhau")
    private List<Lichsuthaydoi> members;

    @OneToMany(mappedBy = "nhankhau")
    private List<Pay> pays;



}
