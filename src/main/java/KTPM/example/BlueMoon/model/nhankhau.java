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
public class nhankhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private Date birthday;
    private boolean gender;
    private String nation;
    private String religion;
    private String cccd;
    private Date date_of_issue;
    private String place_of_issue;
    private String job;
    private String note;

    @OneToMany(mappedBy = "nhankhau")
    private List<tamtrutamvang> temporarilyAbsents;

    @OneToMany(mappedBy = "nhankhau")
    private List<Member> members;

    @OneToMany(mappedBy = "nhankhau")
    private List<hokhau> hokhaus;

    @OneToMany(mappedBy = "nhankhau")
    private List<Pay> pays;
}
