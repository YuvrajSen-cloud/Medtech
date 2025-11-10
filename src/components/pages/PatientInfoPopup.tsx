import { motion } from 'motion/react';
import { BookOpen, Clock, User, HeartPulse, Activity } from 'lucide-react';

interface PatientInfo {
  name: string;
  age: number;
  image?: string;
  chiefComplaint: string;
  medicalHistory: string[];
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    respiratoryRate: number;
    o2Saturation: number;
  };
  allergies: string[];
  currentMedications: string[];
}

interface PatientInfoPopupProps {
  patientInfo: PatientInfo;
  isVisible: boolean;
  onClose: () => void;
}

export function PatientInfoPopup({ patientInfo, isVisible, onClose }: PatientInfoPopupProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="text-[#00A896]" size={24} />
              Patient Information
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <span className="text-muted-foreground">✕</span>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-muted rounded-xl p-4 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00A896] to-[#028090] mb-4 flex items-center justify-center">
                  <span className="text-3xl text-white font-bold">{patientInfo.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold">{patientInfo.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Activity size={14} />
                    {patientInfo.age} years old
                  </span>
                  <span>Male</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <HeartPulse size={14} />
                    Chief Complaint
                  </h4>
                  <p className="bg-muted/50 p-3 rounded-lg">{patientInfo.chiefComplaint}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <BookOpen size={14} />
                    Medical History
                  </h4>
                  <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                    {patientInfo.medicalHistory.map((history, index) => (
                      <p key={index}>• {history}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <HeartPulse size={14} />
                  Current Vitals
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="font-medium">{patientInfo.vitals.heartRate} bpm</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="font-medium">{patientInfo.vitals.bloodPressure}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="font-medium">{patientInfo.vitals.temperature}°C</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">O₂ Saturation</p>
                    <p className="font-medium">{patientInfo.vitals.o2Saturation}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <BookOpen size={14} />
                  Allergies
                </h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                  {patientInfo.allergies.length > 0 ? (
                    patientInfo.allergies.map((allergy, index) => (
                      <p key={index}>• {allergy}</p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No known allergies</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <BookOpen size={14} />
                  Current Medications
                </h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                  {patientInfo.currentMedications.length > 0 ? (
                    patientInfo.currentMedications.map((med, index) => (
                      <p key={index}>• {med}</p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No current medications</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/20 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">Click anywhere outside this box to return to simulation</p>
        </div>
      </motion.div>
    </motion.div>
  );
}