import { useState, useEffect } from "react";
import moment from "moment";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

export interface EventFormValues {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  trainerName?: string;
  customerId?: number;
}

export interface Event extends EventFormValues {
  id?: number;
  isMaintenanceEvent?: boolean;
  customerId?: number;
}

interface EventFormProps {
  event: Event | null;
  initialSlot: { start: Date; end: Date } | null;
  onSubmit: (values: EventFormValues) => void;
  onCancel: () => void;
  isTrainingSession?: boolean;
}

export default function EventForm({
  event, 
  initialSlot,
  onSubmit,
  onCancel,
  isTrainingSession = false
}: EventFormProps) {
  const [formValues, setFormValues] = useState<EventFormValues>({
    title: "",
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), 
    description: "",
    location: "",
    trainerName: "",
    customerId: undefined
  });

  useEffect(() => {
    if (event) {
      setFormValues({
        title: event.title || "",
        start: event.start || new Date(),
        end: event.end || new Date(Date.now() + 60 * 60 * 1000),
        description: event.description || "",
        location: event.location || "",
        trainerName: event.trainerName || "",
        customerId: event.customerId
      });
    } else if (initialSlot) {
      setFormValues(prevValues => ({
        ...prevValues,
        start: initialSlot.start,
        end: initialSlot.end
      }));
    }
  }, [event, initialSlot]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: new Date(value)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const formatDateTimeForInput = (date: Date | string): string => {
    return moment(date).format("YYYY-MM-DDTHH:mm");
  };

  const gymLocations = [
    "Phòng tập chính",
    "Phòng yoga",
    "Phòng cardio",
    "Bể bơi",
    "Khu vực chung"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block mb-1 font-medium text-sm">
          Tiêu đề
        </label>
        <Input
          id="title"
          name="title"
          value={formValues.title}
          onChange={handleChange}
          required
          placeholder={isTrainingSession ? "Ví dụ: Tập Cardio, Yoga..." : "Tiêu đề sự kiện"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start" className="block mb-1 font-medium text-sm">
            Thời gian bắt đầu
          </label>
          <Input
            type="datetime-local"
            id="start"
            name="start"
            value={formatDateTimeForInput(formValues.start)}
            onChange={handleDateTimeChange}
            required
          />
        </div>
        <div>
          <label htmlFor="end" className="block mb-1 font-medium text-sm">
            Thời gian kết thúc
          </label>
          <Input
            type="datetime-local"
            id="end"
            name="end"
            value={formatDateTimeForInput(formValues.end)}
            onChange={handleDateTimeChange}
            required
          />
        </div>
      </div>

      {isTrainingSession && (
        <div>
          <label htmlFor="location" className="block mb-1 font-medium text-sm">
            Địa điểm
          </label>
          <select
            id="location"
            name="location"
            value={formValues.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Chọn địa điểm --</option>
            {gymLocations.map(loc => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      )}

      {isTrainingSession && (
        <div>
          <label htmlFor="trainerName" className="block mb-1 font-medium text-sm">
            Huấn luyện viên
          </label>
          <Input
            id="trainerName"
            name="trainerName"
            value={formValues.trainerName}
            onChange={handleChange}
            placeholder="Tên huấn luyện viên"
          />
        </div>
      )}

      <div>
        <label htmlFor="description" className="block mb-1 font-medium text-sm">
          Mô tả
        </label>
        <Textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={handleChange}
          placeholder={isTrainingSession ? "Mô tả chi tiết về buổi tập..." : "Mô tả sự kiện..."}
          className="min-h-24"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          {event ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </form>
  );
}