import { defineField, defineType } from "sanity";

export interface SocialMedia {
  platform: string;
  label: string;
  url: string;
  emoji?: string;
  order?: number;
}

export const socialMediaType = defineType({
  name: "socialMedia",
  title: "Social Media",
  type: "document",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Displayed text for the link (e.g. @ncdsa or contact@ncdsa.org)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "string",
      description: "Link target, such as https://... or mailto:...",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) {
            return "URL is required";
          }
          if (value.startsWith("https://") || value.startsWith("http://") || value.startsWith("mailto:")) {
            return true;
          }
          return "URL must start with https://, http://, or mailto:";
        }),
    }),
    defineField({
      name: "emoji",
      title: "Emoji",
      type: "string",
      description: "Optional emoji to show in the Get Involved list",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Order (Ascending)",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "platform",
      subtitle: "label",
    },
  },
});
