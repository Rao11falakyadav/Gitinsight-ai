from rest_framework import serializers


class ReadmeAnalysisSerializer(serializers.Serializer):
    repository_id = serializers.IntegerField()


class ResumeAnalysisSerializer(serializers.Serializer):
    resume_text = serializers.CharField(min_length=50)
