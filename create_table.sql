BEGIN;
CREATE TABLE IF NOT EXISTS public."Cư dân"
(
    "Mã cư dân" bigserial NOT NULL,
    "Họ tên" character varying NOT NULL,
    "Căn hộ" character varying NOT NULL,
    "Ngày sinh" date NOT NULL,
    "SĐT" character varying NOT NULL,
    "Email" character varying NOT NULL
);
 
CREATE TABLE IF NOT EXISTS public."Căn hộ"
(
    "Căn hộ" character varying NOT NULL,
    "Số phòng ngủ" integer NOT NULL,
    "Số WC" integer NOT NULL,
    "Số logia" integer NOT NULL,
    "Diện tích" double precision NOT NULL,
    PRIMARY KEY ("Căn hộ")
);
 
CREATE TABLE IF NOT EXISTS public."Xe"
(
    "Biển số" character varying NOT NULL,
    "Căn hộ" character varying NOT NULL,
    "Loại xe" character varying NOT NULL,
    "Trạng thái" character varying NOT NULL,
    PRIMARY KEY ("Biển số")
);
 
CREATE TABLE IF NOT EXISTS public."Phí dịch vụ"
(
    "PKey" bigserial NOT NULL,
    "Căn hộ" character varying NOT NULL,
    "Thời gian" date NOT NULL,
    "Số điện" integer NOT NULL,
    "Số nước" integer NOT NULL,
    "Phí vệ sinh" integer NOT NULL,
    "Phí gửi xe" integer NOT NULL,
    "Trạng thái" character varying NOT NULL,
    PRIMARY KEY ("PKey"),
    UNIQUE ("Căn hộ", "Thời gian")
);
 
CREATE TABLE IF NOT EXISTS public."Khách"
(
    "ID" bigserial NOT NULL,
    "Căn hộ" character varying,
    "Họ tên" character varying NOT NULL,
    "Ngày sinh" date NOT NULL,
    "SĐT" character varying NOT NULL,
    "Email" character varying NOT NULL,
    "Thời hạn dịch vụ" date NOT NULL,
    PRIMARY KEY ("ID")
);
 
CREATE TABLE IF NOT EXISTS public."Hóa đơn"
(
    "Mã hóa đơn" bigserial NOT NULL,
    "ID khách" integer NOT NULL,
    "Thời gian" date NOT NULL,
    "Số tiền" integer NOT NULL,
    "Ra hạn" date NOT NULL,
    "Phương thức thanh toán" character varying NOT NULL,
    PRIMARY KEY ("Mã hóa đơn")
);
 
CREATE TABLE IF NOT EXISTS public."Lịch sử ra vào"
(
    "PKey" bigserial,
    "Biển số" character varying NOT NULL,
    "Thời gian" time with time zone NOT NULL,
    "Ra/Vào" character varying NOT NULL,
    PRIMARY KEY ("PKey")
);
 
CREATE TABLE IF NOT EXISTS public."Loại xe"
(
    "Loại xe" character varying NOT NULL,
    "Phí đỗ xe" integer NOT NULL,
    "Vị trí" character varying NOT NULL
);
 
ALTER TABLE IF EXISTS public."Cư dân"
    ADD FOREIGN KEY ("Căn hộ")
    REFERENCES public."Căn hộ" ("Căn hộ") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
 
ALTER TABLE IF EXISTS public."Xe"
    ADD CONSTRAINT "Căn hộ" FOREIGN KEY ("Căn hộ")
    REFERENCES public."Căn hộ" ("Căn hộ") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
 
ALTER TABLE IF EXISTS public."Xe"
    ADD CONSTRAINT "Loại xe" FOREIGN KEY ("Loại xe")
    REFERENCES public."Loại xe" ("Loại xe") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
 
ALTER TABLE IF EXISTS public."Phí dịch vụ"
    ADD CONSTRAINT "Căn hộ" FOREIGN KEY ("Căn hộ")
    REFERENCES public."Căn hộ" ("Căn hộ") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
 
ALTER TABLE IF EXISTS public."Khách"
    ADD FOREIGN KEY ("Căn hộ")
    REFERENCES public."Cư dân" ("Căn hộ") MATCH SIMPLE
    ON UPDATE SET NULL
    ON DELETE SET NULL
    NOT VALID;
 
ALTER TABLE IF EXISTS public."Hóa đơn"
    ADD CONSTRAINT "ID Khách" FOREIGN KEY ("ID khách")
    REFERENCES public."Khách" ("ID") MATCH SIMPLE
    ON UPDATE SET NULL
    ON DELETE SET NULL
    NOT VALID;
 
ALTER TABLE IF EXISTS public."Lịch sử ra vào"
    ADD CONSTRAINT "Biển số" FOREIGN KEY ("Biển số")
    REFERENCES public."Xe" ("Biển số") MATCH SIMPLE
    ON UPDATE SET NULL
    ON DELETE SET NULL
    NOT VALID;
END;
