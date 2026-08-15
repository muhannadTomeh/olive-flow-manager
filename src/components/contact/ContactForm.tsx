import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate sending email
    // In a real app, this would call an Edge Function or Email API
    const mailtoLink = `mailto:muhannad.tomeh22@gmail.com?subject=${encodeURIComponent(
      subject || "رسالة من موقع المعصرة الذكية"
    )}&body=${encodeURIComponent(
      `الاسم: ${name}\nالبريد الإلكتروني: ${email}\n\nالوصف:\n${message}`
    )}`;
    
    window.location.href = mailtoLink;
    
    toast({
      title: "تم توجيهك لبريد التواصل",
      description: "سيتم فتح تطبيق البريد الخاص بك لإرسال الرسالة.",
    });
    
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">تواصل معنا</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              فريق الدعم الفني لدينا جاهز لمساعدتك في أي استفسار أو مشكلة تواجهها في نظام المعصرة الذكية.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 bg-background p-4 rounded-xl border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">البريد الإلكتروني الرسمي</p>
                  <p className="font-bold">muhannad.tomeh22@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-background p-4 rounded-xl border">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">واتساب الدعم الفني</p>
                  <a 
                    href="https://wa.me/972594596906" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold hover:text-green-600 transition-colors ltr inline-block"
                  >
                    +972 594 596 906
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background p-4 rounded-xl border">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">رقم التواصل الرسمي</p>
                  <p className="font-bold ltr inline-block">0569945677</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle>أرسل لنا رسالة</CardTitle>
              <CardDescription>
                املأ النموذج التالي وسيقوم فريقنا بالرد عليك في أقرب وقت.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكريم</Label>
                  <Input 
                    id="name" 
                    required 
                    placeholder="أدخل اسمك" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">الموضوع / نوع المشكلة</Label>
                  <Input 
                    id="subject" 
                    required 
                    placeholder="مثال: استفسار عن الاشتراك، مشكلة في الفواتير..." 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">وصف المشكلة بالتفصيل</Label>
                  <Textarea 
                    id="message" 
                    required 
                    className="min-h-[120px]" 
                    placeholder="يرجى كتابة تفاصيل ما تواجهه..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
