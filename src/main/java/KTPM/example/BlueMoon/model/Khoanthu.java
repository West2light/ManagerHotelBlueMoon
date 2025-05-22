package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "khoanthu")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Khoanthu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int khoanthuid;
    private String tenkhoanthu;
    private int tinhchat;
    private Date ngaytao;
    private Date thoihan;
    private String ghichu;

    @OneToMany(mappedBy = "khoanthu")
    private List<Pay> pays;
}
