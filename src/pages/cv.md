---
layout: page
title: Curriculum
permalink: /curriculum/
---

{% for job in site.jobs reversed %}
#### <u>{{ job.position }}</u>
<img src="/assets/images/{{ job.logo }}" class="job-logo is-hidden-mobile">
##### {{ job.organization }}
<small>{{ job.start_date }} - {{ job.end_date }} {% if job.duration %}({{ job.duration }}){% endif %}</small>  
<small>{{ job.location }}</small>
{{ job.content }}
<br>
{% endfor %}

<link rel="stylesheet" href="/assets/styles/cv.css">
