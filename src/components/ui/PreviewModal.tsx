"use client";
import { t } from "@/lib/i18n";
import { Locale } from "@/lib/i18n";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: {
    client_name: string;
    client_email: string;
    client_phone?: string;
    project_type: string;
    description: string;
    colors?: string;
    budget?: string;
    deadline?: string;
    inspirations?: string;
    selectedColors?: string[];
  };
  locale: Locale;
}

export default function PreviewModal({
  isOpen,
  onClose,
  onConfirm,
  formData,
  locale,
}: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Prévisualisation de votre demande
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
              {t('form.step1.title', locale)}
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">{t('form.name.label', locale)}:</span>{" "}
                <span className="text-gray-900">{formData.client_name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">{t('form.email.label', locale)}:</span>{" "}
                <span className="text-gray-900">{formData.client_email}</span>
              </div>
              {formData.client_phone && (
                <div>
                  <span className="font-medium text-gray-600">{t('form.phone.label', locale)}:</span>{" "}
                  <span className="text-gray-900">{formData.client_phone}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">{t('form.type.label', locale)}:</span>{" "}
                <span className="text-gray-900">
                  {formData.project_type === 'portfolio' && t('form.type.portfolio', locale)}
                  {formData.project_type === 'ecommerce' && t('form.type.ecommerce', locale)}
                  {formData.project_type === 'blog' && t('form.type.blog', locale)}
                  {formData.project_type === 'corporate' && t('form.type.corporate', locale)}
                  {formData.project_type === 'landing' && t('form.type.landing', locale)}
                  {formData.project_type === 'autre' && t('form.type.other', locale)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">{t('form.description.label', locale)}:</span>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{formData.description}</p>
              </div>
            </div>
          </div>

          {/* Détails optionnels */}
          {(formData.selectedColors?.length || formData.budget || formData.deadline || formData.inspirations) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                {t('form.step2.title', locale)}
              </h3>
              <div className="space-y-2 text-sm">
                {formData.selectedColors && formData.selectedColors.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600">{t('form.colors.label', locale)}:</span>
                    <div className="flex gap-2 mt-1">
                      {formData.selectedColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {formData.budget && (
                  <div>
                    <span className="font-medium text-gray-600">{t('form.budget.label', locale)}:</span>{" "}
                    <span className="text-gray-900">{formData.budget}</span>
                  </div>
                )}
                {formData.deadline && (
                  <div>
                    <span className="font-medium text-gray-600">{t('form.deadline.label', locale)}:</span>{" "}
                    <span className="text-gray-900">
                      {new Date(formData.deadline).toLocaleDateString(
                        locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US'
                      )}
                    </span>
                  </div>
                )}
                {formData.inspirations && (
                  <div>
                    <span className="font-medium text-gray-600">{t('form.inspirations.label', locale)}:</span>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{formData.inspirations}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            {t('form.back', locale)}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            {t('form.submit', locale)}
          </button>
        </div>
      </div>
    </div>
  );
}

