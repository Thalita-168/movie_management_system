from rest_framework import generics, permissions
from .models import Payment
from .serializers import PaymentSerializer

class PaymentList(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(booking__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()